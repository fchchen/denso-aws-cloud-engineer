import { Kafka } from "kafkajs";
import { randomUUID } from "crypto";
import { createLogger } from "../shared/logger.mjs";
import { validateTenantId } from "../shared/validation.mjs";
import { accepted, badRequest, unauthorized, internalError } from "../shared/response.mjs";
import { denso } from "../shared/telemetry_pb.mjs";
import { generateAuthToken } from "aws-msk-iam-sasl-signer-js";

const VehicleTelemetry = denso.telemetry.v1.VehicleTelemetry;

const BOOTSTRAP_BROKERS = process.env.KAFKA_BOOTSTRAP_BROKERS;
const KAFKA_TOPIC       = process.env.KAFKA_TOPIC;
const AWS_REGION        = process.env.AWS_REGION ?? "us-east-1";

let producer = null;

async function getProducer() {
  if (producer) return producer;
  const kafka = new Kafka({
    clientId: "ingest-lambda",
    brokers:  [BOOTSTRAP_BROKERS],
    ssl: true,
    sasl: {
      mechanism: "oauthbearer",
      oauthBearerProvider: async () => {
        const { token, expiryTime } = await generateAuthToken({ region: AWS_REGION });
        return { value: token, lifetime: expiryTime };
      },
    },
  });
  producer = kafka.producer();
  await producer.connect();
  return producer;
}

export async function handler(event, context) {
  const log = createLogger(context);
  const start = Date.now();

  const tenantId = event.headers?.["x-tenant-id"] ?? event.headers?.["X-Tenant-Id"];
  if (!tenantId || !validateTenantId(tenantId)) {
    log.warn("Invalid or missing x-tenant-id", { tenantId });
    return unauthorized(context.awsRequestId);
  }

  // Decode Protobuf body
  let proto;
  try {
    const buf = Buffer.from(event.body, event.isBase64Encoded ? "base64" : "binary");
    proto = VehicleTelemetry.decode(buf);
    const err = VehicleTelemetry.verify(proto);
    if (err) throw new Error(err);
  } catch (e) {
    log.warn("Protobuf decode failed", { error: e.message });
    return badRequest(`Invalid Protobuf payload: ${e.message}`, context.awsRequestId);
  }

  const messageId  = randomUUID();
  const receivedAt = new Date().toISOString();

  // Encode back to bytes with messageId + receivedAt added
  const record = VehicleTelemetry.create({
    ...proto,
    messageId,
    receivedAt,
  });
  const bytes = VehicleTelemetry.encode(record).finish();

  const jsonSize  = JSON.stringify(VehicleTelemetry.toObject(record)).length;
  const protoSize = bytes.length;

  try {
    const p = await getProducer();
    await p.send({
      topic: KAFKA_TOPIC,
      messages: [{
        key:   proto.deviceId,   // same device → same partition → ordering preserved
        value: Buffer.from(bytes),
      }],
    });

    log.info("Telemetry queued", {
      deviceId: proto.deviceId,
      tenantId,
      messageId,
      protoBytes: protoSize,
      jsonBytes: jsonSize,
      durationMs: Date.now() - start,
    });
    return accepted({ messageId, timestamp: receivedAt }, context.awsRequestId);
  } catch (err) {
    log.error("Failed to produce to Kafka", { error: err.message, deviceId: proto.deviceId });
    return internalError(context.awsRequestId);
  }
}

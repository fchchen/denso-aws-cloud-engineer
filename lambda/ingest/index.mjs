import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import { createLogger } from "../shared/logger.mjs";
import { validateTelemetryPayload, validateTenantId } from "../shared/validation.mjs";
import { accepted, badRequest, unauthorized, internalError } from "../shared/response.mjs";

const s3 = new S3Client({});
const dynamo = new DynamoDBClient({});

const BUCKET = process.env.TELEMETRY_BUCKET_NAME;
const TABLE  = process.env.DYNAMODB_TABLE_NAME;

export async function handler(event, context) {
  const log = createLogger(context);
  const requestId = context.awsRequestId;
  const start = Date.now();

  const tenantId = event.headers?.["x-tenant-id"] ?? event.headers?.["X-Tenant-Id"];
  if (!tenantId || !validateTenantId(tenantId)) {
    log.warn("Invalid or missing x-tenant-id", { tenantId });
    return unauthorized(requestId);
  }

  const result = validateTelemetryPayload(event.body);
  if (!result.valid) {
    log.warn("Payload validation failed", { errors: result.errors });
    return badRequest(`Validation failed: ${result.errors.join("; ")}`, requestId);
  }

  const { deviceId, timestamp, speed, rpm, fuel, lat, lng } = result.data;
  const messageId = randomUUID();
  const date = timestamp.slice(0, 10);
  const s3Key = `raw/${tenantId}/${deviceId}/${date}/${messageId}.json`;

  const payload = { messageId, tenantId, deviceId, timestamp, speed, rpm, fuel, lat, lng, receivedAt: new Date().toISOString() };

  try {
    await Promise.all([
      s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: JSON.stringify(payload),
        ContentType: "application/json",
      })),
      dynamo.send(new PutItemCommand({
        TableName: TABLE,
        Item: {
          deviceId:   { S: deviceId },
          timestamp:  { S: timestamp },
          tenantId:   { S: tenantId },
          messageId:  { S: messageId },
          speed:      { N: String(speed) },
          rpm:        { N: String(rpm) },
          fuel:       { N: String(fuel) },
          lat:        { N: String(lat) },
          lng:        { N: String(lng) },
          s3Key:      { S: s3Key },
          receivedAt: { S: payload.receivedAt },
        },
      })),
    ]);

    log.info("Telemetry ingested", { deviceId, tenantId, messageId, durationMs: Date.now() - start });
    return accepted({ messageId, timestamp: payload.receivedAt }, requestId);
  } catch (err) {
    log.error("Failed to store telemetry", { error: err.message, deviceId, tenantId });
    return internalError(requestId);
  }
}

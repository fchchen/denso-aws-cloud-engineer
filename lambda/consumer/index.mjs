import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { createLogger } from "../shared/logger.mjs";
import { denso } from "../shared/telemetry_pb.mjs";

const VehicleTelemetry = denso.telemetry.v1.VehicleTelemetry;

const s3     = new S3Client({});
const dynamo = new DynamoDBClient({});

const BUCKET = process.env.TELEMETRY_BUCKET_NAME;
const TABLE  = process.env.DYNAMODB_TABLE_NAME;

export async function handler(event, context) {
  const log = createLogger(context);

  const records = event.records?.["vehicle-telemetry"] ?? [];

  await Promise.all(records.map(async (record) => {
    let payload;
    try {
      const buf = Buffer.from(record.value, "base64");
      payload = VehicleTelemetry.toObject(VehicleTelemetry.decode(buf), { defaults: true });
    } catch (e) {
      log.error("Protobuf decode failed in consumer", { error: e.message });
      return;
    }

    const { deviceId, tenantId, timestamp, messageId, receivedAt, speed, rpm, fuel, lat, lng } = payload;
    const date  = timestamp.slice(0, 10);
    const s3Key = `raw/${tenantId}/${deviceId}/${date}/${messageId}.json`;

    try {
      await Promise.all([
        s3.send(new PutObjectCommand({
          Bucket:      BUCKET,
          Key:         s3Key,
          Body:        JSON.stringify(payload),
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
            receivedAt: { S: receivedAt },
          },
        })),
      ]);

      log.info("Record stored", { deviceId, tenantId, messageId, s3Key });
    } catch (err) {
      log.error("Failed to store record", { error: err.message, deviceId, messageId });
      throw err;  // rethrow so Lambda retries the batch
    }
  }));
}

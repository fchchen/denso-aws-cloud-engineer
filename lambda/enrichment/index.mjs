import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { createLogger } from "../shared/logger.mjs";

const s3 = new S3Client({});
const dynamo = new DynamoDBClient({});

const BUCKET = process.env.TELEMETRY_BUCKET_NAME;
const TABLE  = process.env.DYNAMODB_TABLE_NAME;

export async function handler(event, context) {
  const log = createLogger(context);

  for (const record of event.Records) {
    const s3Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const start = Date.now();

    try {
      const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: s3Key }));
      const raw = JSON.parse(await streamToString(getRes.Body));

      const enriched = enrich(raw);
      const enrichedKey = s3Key.replace(/^raw\//, "enriched/");

      await Promise.all([
        s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: enrichedKey,
          Body: JSON.stringify(enriched),
          ContentType: "application/json",
        })),
        dynamo.send(new UpdateItemCommand({
          TableName: TABLE,
          Key: {
            deviceId:  { S: raw.deviceId },
            timestamp: { S: raw.timestamp },
          },
          UpdateExpression: "SET speedKmh = :skm, anomalyFlag = :af, enrichedAt = :ea, processingLatencyMs = :lat, enrichedKey = :ek",
          ExpressionAttributeValues: {
            ":skm": { N: String(enriched.speedKmh) },
            ":af":  { BOOL: enriched.anomalyFlag },
            ":ea":  { S: enriched.enrichedAt },
            ":lat": { N: String(enriched.processingLatencyMs) },
            ":ek":  { S: enrichedKey },
          },
        })),
      ]);

      log.info("Enrichment complete", { s3Key, deviceId: raw.deviceId, anomalyFlag: enriched.anomalyFlag, durationMs: Date.now() - start });
    } catch (err) {
      log.error("Enrichment failed", { s3Key, error: err.message });
    }
  }
}

function enrich(raw) {
  const speedKmh = parseFloat((raw.speed * 1.60934).toFixed(2));
  const anomalyFlag = raw.speed > 120 || raw.rpm > 6000 || raw.fuel < 10;
  const zone = geoZone(raw.lat, raw.lng);

  return {
    ...raw,
    speedKmh,
    anomalyFlag,
    zone,
    enrichedAt: new Date().toISOString(),
    processingLatencyMs: Date.now() - new Date(raw.receivedAt).getTime(),
  };
}

function geoZone(lat, lng) {
  if (lat >= 42 && lat <= 43 && lng >= -84 && lng <= -82) return "DETROIT-METRO";
  if (lat >= 41 && lat <= 44 && lng >= -88 && lng <= -82) return "MIDWEST";
  return "UNKNOWN";
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { createLogger } from "../shared/logger.mjs";
import { ok, badRequest, internalError } from "../shared/response.mjs";

const dynamo = new DynamoDBClient({});
const TABLE = process.env.DYNAMODB_TABLE_NAME;

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

export async function handler(event, context) {
  const log = createLogger(context);
  const requestId = context.awsRequestId;
  const start = Date.now();

  const deviceId = event.pathParameters?.deviceId;
  if (!deviceId) return badRequest("Missing deviceId path parameter", requestId);

  const qs = event.queryStringParameters ?? {};
  const limit = Math.min(parseInt(qs.limit ?? DEFAULT_LIMIT, 10), MAX_LIMIT);
  const from = qs.from ?? "0000-01-01T00:00:00.000Z";
  const to   = qs.to   ?? "9999-12-31T23:59:59.999Z";

  let exclusiveStartKey;
  if (qs.nextToken) {
    try {
      exclusiveStartKey = JSON.parse(Buffer.from(qs.nextToken, "base64").toString("utf-8"));
    } catch {
      return badRequest("Invalid nextToken", requestId);
    }
  }

  try {
    const res = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "deviceId = :did AND #ts BETWEEN :from AND :to",
      ExpressionAttributeNames: { "#ts": "timestamp" },
      ExpressionAttributeValues: {
        ":did":  { S: decodeURIComponent(deviceId) },
        ":from": { S: from },
        ":to":   { S: to },
      },
      Limit: limit,
      ScanIndexForward: false,
      ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
    }));

    const items = (res.Items ?? []).map(unmarshal);
    const nextToken = res.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(res.LastEvaluatedKey)).toString("base64")
      : null;

    log.info("Query complete", { deviceId, count: items.length, durationMs: Date.now() - start });

    return ok({ items, count: items.length, nextToken }, requestId);
  } catch (err) {
    log.error("Query failed", { deviceId, error: err.message });
    return internalError(requestId);
  }
}

function unmarshal(item) {
  const out = {};
  for (const [k, v] of Object.entries(item)) {
    if (v.S !== undefined)    out[k] = v.S;
    else if (v.N !== undefined) out[k] = parseFloat(v.N);
    else if (v.BOOL !== undefined) out[k] = v.BOOL;
    else out[k] = v;
  }
  return out;
}

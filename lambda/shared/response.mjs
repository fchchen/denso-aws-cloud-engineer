const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,x-api-key,x-tenant-id",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

export function ok(body, requestId) {
  return respond(200, body, requestId);
}

export function accepted(body, requestId) {
  return respond(202, body, requestId);
}

export function badRequest(message, requestId) {
  return respond(400, { error: message }, requestId);
}

export function unauthorized(requestId) {
  return respond(401, { error: "Unauthorized" }, requestId);
}

export function internalError(requestId) {
  return respond(500, { error: "Internal server error", requestId }, requestId);
}

function respond(statusCode, body, requestId) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": requestId ?? "unknown",
      ...CORS_HEADERS,
    },
    body: JSON.stringify(body),
  };
}

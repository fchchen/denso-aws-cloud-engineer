const ALLOWED_TENANTS = ["TENANT#DENSO-CORP", "TENANT#ACME-MOTORS"];

export function validateTelemetryPayload(body) {
  let parsed;
  try {
    parsed = typeof body === "string" ? JSON.parse(body) : body;
  } catch {
    return { valid: false, errors: ["Body is not valid JSON"] };
  }

  const errors = [];
  const required = { deviceId: "string", timestamp: "string", speed: "number", rpm: "number", fuel: "number", lat: "number", lng: "number" };

  for (const [field, type] of Object.entries(required)) {
    if (parsed[field] === undefined || parsed[field] === null) {
      errors.push(`Missing required field: ${field}`);
    } else if (typeof parsed[field] !== type) {
      errors.push(`Field '${field}' must be a ${type}, got ${typeof parsed[field]}`);
    }
  }

  if (parsed.speed !== undefined && (parsed.speed < 0 || parsed.speed > 300)) {
    errors.push("speed must be between 0 and 300 mph");
  }
  if (parsed.rpm !== undefined && (parsed.rpm < 0 || parsed.rpm > 10000)) {
    errors.push("rpm must be between 0 and 10000");
  }
  if (parsed.fuel !== undefined && (parsed.fuel < 0 || parsed.fuel > 100)) {
    errors.push("fuel must be between 0 and 100 (percent)");
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, data: parsed };
}

export function validateTenantId(tenantId) {
  return ALLOWED_TENANTS.includes(tenantId);
}

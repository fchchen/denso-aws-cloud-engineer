#!/usr/bin/env node
/**
 * Vehicle Telemetry Simulator — Protobuf Edition
 * Encodes payloads as binary Protobuf before sending.
 *
 * Usage:
 *   node simulator.js --vehicles 3 --readings 10 --interval 400 \
 *     --api-url https://abc123.cloudfront.net --api-key YOUR_KEY
 *
 * Load test (1000 req/sec burst):
 *   node simulator.js --vehicles 200 --readings 5 --interval 0 \
 *     --api-url $CF_URL --api-key $API_KEY
 */

import https from "https";
import http from "http";
import { parseArgs } from "util";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const protobuf = require("protobufjs");

const { values: args } = parseArgs({
  options: {
    "vehicles":  { type: "string", default: "3" },
    "readings":  { type: "string", default: "10" },
    "interval":  { type: "string", default: "400" },
    "api-url":   { type: "string", default: "" },
    "api-key":   { type: "string", default: "" },
  },
});

const NUM_VEHICLES  = parseInt(args["vehicles"],  10);
const NUM_READINGS  = parseInt(args["readings"],  10);
const INTERVAL_MS   = parseInt(args["interval"],  10);
const API_URL       = args["api-url"];
const API_KEY       = args["api-key"];

if (!API_URL || !API_KEY) {
  console.error("ERROR: --api-url and --api-key are required");
  process.exit(1);
}

const TENANTS = ["TENANT#DENSO-CORP", "TENANT#ACME-MOTORS"];

const BASE_LOCATIONS = [
  { lat: 42.3314, lng: -83.0458 },
  { lat: 42.5006, lng: -83.1299 },
  { lat: 42.4534, lng: -83.3777 },
];

function generateVin() {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  return "VIN-" + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function drivingCycle(reading, total) {
  const progress = reading / total;
  if (progress < 0.2)      return progress / 0.2;
  else if (progress < 0.5) return 1;
  else if (progress < 0.7) return 0.5 + (progress - 0.5) * 2.5;
  else if (progress < 0.9) return 0.8;
  else                     return 1 - (progress - 0.9) / 0.1;
}

function buildPayload(vin, tenantId, reading, total, baseLoc) {
  const throttle = drivingCycle(reading, total);
  return {
    deviceId:  `VEHICLE#${vin}`,
    tenantId,
    timestamp: new Date().toISOString(),
    speed:     parseFloat((throttle * 75 + Math.random() * 5).toFixed(1)),
    rpm:       Math.round(800 + throttle * 4200 + Math.random() * 200),
    fuel:      parseFloat(Math.max(0, 80 - reading * 0.8 + Math.random()).toFixed(1)),
    lat:       parseFloat((baseLoc.lat + reading * 0.001 + (Math.random() - 0.5) * 0.0005).toFixed(6)),
    lng:       parseFloat((baseLoc.lng + reading * 0.001 + (Math.random() - 0.5) * 0.0005).toFixed(6)),
  };
}

function post(url, apiKey, tenantId, protoBytes) {
  return new Promise((resolve) => {
    const parsed = new URL(url + "/v1/telemetry");
    const lib = parsed.protocol === "https:" ? https : http;

    const req = lib.request({
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path:     parsed.pathname,
      method:   "POST",
      headers: {
        "Content-Type":   "application/x-protobuf",
        "Content-Length": protoBytes.length,
        "x-api-key":      apiKey,
        "x-tenant-id":    tenantId,
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });

    req.on("error", (e) => resolve({ status: 0, body: e.message }));
    req.write(protoBytes);
    req.end();
  });
}

function statusEmoji(code) {
  if (code >= 200 && code < 300) return "✓";
  if (code >= 400 && code < 500) return "✗";
  return "?";
}

function pad(str, n) { return String(str).padEnd(n); }

async function main() {
  // Load Protobuf schema
  const root = await protobuf.load(new URL("../proto/telemetry.proto", import.meta.url).pathname);
  const VehicleTelemetry = root.lookupType("denso.telemetry.v1.VehicleTelemetry");

  const vehicles = Array.from({ length: NUM_VEHICLES }, (_, i) => ({
    vin:      generateVin(),
    tenantId: TENANTS[i % TENANTS.length],
    baseLoc:  BASE_LOCATIONS[i % BASE_LOCATIONS.length],
  }));

  // Show payload size comparison on first message
  const samplePayload = buildPayload(vehicles[0].vin, vehicles[0].tenantId, 0, NUM_READINGS, vehicles[0].baseLoc);
  const sampleProto   = VehicleTelemetry.encode(VehicleTelemetry.create(samplePayload)).finish();
  const jsonSize      = JSON.stringify(samplePayload).length;
  const protoSize     = sampleProto.length;

  console.log(`\nVehicle Telemetry Simulator — Protobuf Edition`);
  console.log(`Endpoint  : ${API_URL}/v1/telemetry`);
  console.log(`Vehicles  : ${NUM_VEHICLES}  |  Readings: ${NUM_READINGS}  |  Interval: ${INTERVAL_MS}ms`);
  console.log(`Encoding  : Protobuf ${protoSize}B vs JSON ${jsonSize}B  (${(jsonSize/protoSize).toFixed(1)}x smaller)\n`);
  console.log(pad("VIN", 14) + pad("Tenant", 22) + pad("Reading", 9) + pad("Speed(mph)", 12) + pad("RPM", 8) + pad("Fuel%", 8) + "Status");
  console.log("-".repeat(80));

  let accepted = 0, failed = 0;

  for (let r = 0; r < NUM_READINGS; r++) {
    const requests = vehicles.map(async (v) => {
      const payload    = buildPayload(v.vin, v.tenantId, r, NUM_READINGS, v.baseLoc);
      const protoBytes = VehicleTelemetry.encode(VehicleTelemetry.create(payload)).finish();
      const res        = await post(API_URL, API_KEY, v.tenantId, protoBytes);
      const emoji      = statusEmoji(res.status);
      if (res.status >= 200 && res.status < 300) accepted++; else failed++;
      console.log(
        pad(v.vin, 14) +
        pad(v.tenantId.replace("TENANT#", ""), 22) +
        pad(`${r + 1}/${NUM_READINGS}`, 9) +
        pad(payload.speed, 12) +
        pad(payload.rpm, 8) +
        pad(payload.fuel, 8) +
        `${emoji} ${res.status}`
      );
    });

    await Promise.all(requests);

    if (r < NUM_READINGS - 1 && INTERVAL_MS > 0) {
      await new Promise((r) => setTimeout(r, INTERVAL_MS));
    }
  }

  const total = accepted + failed;
  console.log(`\nSimulation complete. ${accepted}/${total} accepted (202).`);
  console.log(`\nQuery a vehicle:\n  curl -H "x-api-key: ${API_KEY}" "${API_URL}/v1/devices/VEHICLE%23${vehicles[0].vin}/telemetry?limit=10"\n`);
}

main().catch(console.error);

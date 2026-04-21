# Vehicle Telemetry Ingestion Service

A serverless IoT data pipeline on AWS that ingests real-time vehicle telemetry from embedded sensors, stores and enriches the data, and serves it via a secure REST API. Built to demonstrate production-grade cloud engineering for a multi-tenant automotive fleet management platform.

```
Vehicles / Simulator
        |
        | HTTPS POST /v1/telemetry
        v
  ┌─────────────────────────────────────────────────────┐
  │  CloudFront (CDN, DDoS shield, cache GETs 30s)      │
  └───────────────────────┬─────────────────────────────┘
                          │
  ┌───────────────────────▼─────────────────────────────┐
  │  API Gateway REST (API key auth, usage plan 1k/day) │
  └──────────┬────────────────────────┬─────────────────┘
             │                        │
   ┌─────────▼────────┐    ┌──────────▼──────────┐
   │  Ingest Lambda   │    │   Query Lambda       │
   │  POST /v1/telemetry   │   GET /v1/devices/{id}/telemetry
   └──────┬─────┬─────┘    └──────────┬──────────┘
          │     │                     │
          │     └──────► DynamoDB ◄───┘
          │              (single table, tenant GSI)
          ▼
       S3 raw bucket
          │
          │ ObjectCreated event
          ▼
   ┌──────────────────┐
   │ Enrichment Lambda│
   │ anomaly flag,    │
   │ unit conversion, │
   │ geo zone         │
   └──────────────────┘
          │
          ▼
       S3 enriched/
```

## Architecture Highlights

| Concern | Approach |
|---|---|
| **Security** | CloudFront-only ingress, API key + tenant header auth, least-privilege IAM roles per Lambda, SSE-S3, HTTPS-only |
| **Multi-tenancy** | `tenantId` enforced in Lambda; DynamoDB GSI for tenant-scoped queries; two simulated tenants |
| **Cost** | ~$0/month idle — Lambda/DynamoDB/S3 all consumption-priced, no NAT Gateway, no RDS |
| **IaC** | Full Terraform modules (vpc, iam, s3, dynamodb, lambda, api_gateway, cloudfront) |
| **Observability** | Structured JSON CloudWatch logs with requestId, tenantId, deviceId, durationMs |

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- [Node.js](https://nodejs.org/) >= 20
- AWS CLI configured (`aws configure`)

## Deploy

```bash
# 1. Initialize Terraform
cd terraform
terraform init

# 2. Preview changes
terraform plan

# 3. Deploy (~3-5 minutes; CloudFront takes longest)
terraform apply -auto-approve

# 4. Get your API key
API_KEY_ID=$(terraform output -raw api_key_id)
API_KEY=$(aws apigateway get-api-key --api-key $API_KEY_ID --include-value --query value --output text)
CF_URL=$(terraform output -raw cloudfront_url)

echo "API Key : $API_KEY"
echo "CF URL  : $CF_URL"
```

## Run the Simulator

```bash
cd ../simulator
node simulator.js \
  --vehicles 3 \
  --readings 10 \
  --interval 400 \
  --api-url $CF_URL \
  --api-key $API_KEY
```

Output:
```
Vehicle Telemetry Simulator
Endpoint : https://abc123.cloudfront.net/v1/telemetry
Vehicles : 3  |  Readings: 10  |  Interval: 400ms

VIN           Tenant                Reading  Speed(mph)  RPM     Fuel%   Status
--------------------------------------------------------------------------------
VIN-AB3XK7Z1  DENSO-CORP            1/10     12.4        2847    80.0    ✓ 202
VIN-Q9MN2P4L  ACME-MOTORS           1/10     13.1        2901    80.0    ✓ 202
...
```

## Query Telemetry

```bash
# Latest 10 readings for a vehicle
curl -s -H "x-api-key: $API_KEY" \
  "$CF_URL/v1/devices/VEHICLE%23VIN-AB3XK7Z1/telemetry?limit=10" | jq .

# Time-range query
curl -s -H "x-api-key: $API_KEY" \
  "$CF_URL/v1/devices/VEHICLE%23VIN-AB3XK7Z1/telemetry?from=2026-04-01T00:00:00Z&to=2026-12-31T23:59:59Z" | jq .

# Health check (no API key needed)
curl -s "$CF_URL/v1/health"
```

## Teardown

```bash
cd terraform
terraform destroy -auto-approve
```

All resources are destroyed. **Cost during demo window: ~$0.00.**

## Production Enhancements

1. **Kinesis Data Streams** between API Gateway and Lambda for backpressure, replay, and fan-out at high vehicle counts
2. **AWS IoT Core** as the device protocol layer — MQTT + certificate-based auth for embedded sensors
3. **Amazon Athena** on the S3 data lake for ad-hoc SQL analytics without a running database
4. **Cognito + Lambda Authorizer** to replace API key auth with JWT-based tenant claims
5. **KMS CMK** encryption for DynamoDB and S3 instead of AWS-managed keys

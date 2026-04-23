resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project}-${var.environment}"
  description = "Vehicle Telemetry Ingestion API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.tags
}

# ---------- /v1 ----------

resource "aws_api_gateway_resource" "v1" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "v1"
}

# ---------- /v1/health ----------

resource "aws_api_gateway_resource" "health" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.v1.id
  path_part   = "health"
}

resource "aws_api_gateway_method" "health_get" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.health.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "health_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.health.id
  http_method = aws_api_gateway_method.health_get.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "health_get_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.health.id
  http_method = aws_api_gateway_method.health_get.http_method
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "health_get_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.health.id
  http_method = aws_api_gateway_method.health_get.http_method
  status_code = "200"
  response_templates = {
    "application/json" = "{\"status\":\"ok\"}"
  }
  depends_on = [aws_api_gateway_integration.health_get]
}

# ---------- /v1/telemetry ----------

resource "aws_api_gateway_resource" "telemetry" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.v1.id
  path_part   = "telemetry"
}

resource "aws_api_gateway_request_validator" "body" {
  rest_api_id          = aws_api_gateway_rest_api.main.id
  name                 = "validate-body"
  validate_request_body = true
}

resource "aws_api_gateway_method" "telemetry_post" {
  rest_api_id          = aws_api_gateway_rest_api.main.id
  resource_id          = aws_api_gateway_resource.telemetry.id
  http_method          = "POST"
  authorization        = "NONE"
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.body.id
}

resource "aws_api_gateway_integration" "telemetry_post" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.telemetry.id
  http_method             = aws_api_gateway_method.telemetry_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.ingest_invoke_arn
}

resource "aws_lambda_permission" "ingest" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.ingest_function_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# ---------- /v1/devices/{deviceId}/telemetry ----------

resource "aws_api_gateway_resource" "devices" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.v1.id
  path_part   = "devices"
}

resource "aws_api_gateway_resource" "device_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.devices.id
  path_part   = "{deviceId}"
}

resource "aws_api_gateway_resource" "device_telemetry" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.device_id.id
  path_part   = "telemetry"
}

resource "aws_api_gateway_method" "device_telemetry_get" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.device_telemetry.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true

  request_parameters = {
    "method.request.path.deviceId"        = true
    "method.request.querystring.from"     = false
    "method.request.querystring.to"       = false
    "method.request.querystring.limit"    = false
    "method.request.querystring.nextToken" = false
  }
}

resource "aws_api_gateway_integration" "device_telemetry_get" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.device_telemetry.id
  http_method             = aws_api_gateway_method.device_telemetry_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.query_invoke_arn
}

resource "aws_lambda_permission" "query" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.query_function_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# ---------- Deployment ----------

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.telemetry.id,
      aws_api_gateway_method.telemetry_post.id,
      aws_api_gateway_integration.telemetry_post.id,
      aws_api_gateway_resource.device_telemetry.id,
      aws_api_gateway_method.device_telemetry_get.id,
      aws_api_gateway_integration.device_telemetry_get.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.health_get,
    aws_api_gateway_integration.telemetry_post,
    aws_api_gateway_integration.device_telemetry_get,
  ]
}

resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = var.environment

  tags = var.tags
}

# ---------- API Key + Usage Plan ----------

resource "aws_api_gateway_api_key" "main" {
  name    = "${var.project}-${var.environment}-key"
  enabled = true
  tags    = var.tags
}

resource "aws_api_gateway_usage_plan" "main" {
  name = "${var.project}-${var.environment}-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.main.id
    stage  = aws_api_gateway_stage.main.stage_name
  }

  throttle_settings {
    burst_limit = 5000
    rate_limit  = 1000
  }

  quota_settings {
    limit  = 10000000
    period = "DAY"
  }

  tags = var.tags
}

resource "aws_api_gateway_usage_plan_key" "main" {
  key_id        = aws_api_gateway_api_key.main.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.main.id
}

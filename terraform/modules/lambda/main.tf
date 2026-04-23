locals {
  build_dir = "${path.root}/../.build"

  common_env = {
    TELEMETRY_BUCKET_NAME    = var.raw_bucket_name
    DYNAMODB_TABLE_NAME      = var.dynamodb_table_name
    ENVIRONMENT              = var.environment
    KAFKA_BOOTSTRAP_BROKERS  = var.kafka_bootstrap_brokers
    KAFKA_TOPIC              = "vehicle-telemetry"
  }
}

# Single zip of the entire lambda/ directory so shared/ utilities resolve correctly
data "archive_file" "all" {
  type        = "zip"
  source_dir  = "${path.root}/../lambda"
  output_path = "${local.build_dir}/lambda.zip"
}

# ---------- Ingest ----------

resource "aws_lambda_function" "ingest" {
  filename         = data.archive_file.all.output_path
  function_name    = "${var.project}-${var.environment}-ingest"
  role             = var.ingest_role_arn
  handler          = "ingest/index.handler"
  runtime          = "nodejs22.x"
  memory_size      = 256
  timeout          = 10
  source_code_hash = data.archive_file.all.output_base64sha256

  environment {
    variables = local.common_env
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.lambda_sg_id]
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "ingest" {
  name              = "/aws/lambda/${aws_lambda_function.ingest.function_name}"
  retention_in_days = 7
  tags              = var.tags
}

# ---------- Consumer ----------

resource "aws_lambda_function" "consumer" {
  filename         = data.archive_file.all.output_path
  function_name    = "${var.project}-${var.environment}-consumer"
  role             = var.consumer_role_arn
  handler          = "consumer/index.handler"
  runtime          = "nodejs22.x"
  memory_size      = 512
  timeout          = 60
  source_code_hash = data.archive_file.all.output_base64sha256

  environment {
    variables = local.common_env
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.lambda_sg_id]
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "consumer" {
  name              = "/aws/lambda/${aws_lambda_function.consumer.function_name}"
  retention_in_days = 7
  tags              = var.tags
}

resource "aws_lambda_event_source_mapping" "kafka" {
  event_source_arn  = var.msk_cluster_arn
  function_name     = aws_lambda_function.consumer.arn
  starting_position = "LATEST"
  batch_size        = 100

  amazon_managed_kafka_event_source_config {
    consumer_group_id = "vehicle-telemetry-consumers"
  }

  topics = ["vehicle-telemetry"]
}

# ---------- Enrichment ----------

resource "aws_lambda_function" "enrichment" {
  filename         = data.archive_file.all.output_path
  function_name    = "${var.project}-${var.environment}-enrichment"
  role             = var.enrichment_role_arn
  handler          = "enrichment/index.handler"
  runtime          = "nodejs22.x"
  memory_size      = 512
  timeout          = 60
  source_code_hash = data.archive_file.all.output_base64sha256

  environment {
    variables = local.common_env
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "enrichment" {
  name              = "/aws/lambda/${aws_lambda_function.enrichment.function_name}"
  retention_in_days = 7
  tags              = var.tags
}

resource "aws_lambda_permission" "s3_invoke_enrichment" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.enrichment.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.raw_bucket_arn
}

# ---------- Query ----------

resource "aws_lambda_function" "query" {
  filename         = data.archive_file.all.output_path
  function_name    = "${var.project}-${var.environment}-query"
  role             = var.query_role_arn
  handler          = "query/index.handler"
  runtime          = "nodejs22.x"
  memory_size      = 256
  timeout          = 10
  source_code_hash = data.archive_file.all.output_base64sha256

  environment {
    variables = local.common_env
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "query" {
  name              = "/aws/lambda/${aws_lambda_function.query.function_name}"
  retention_in_days = 7
  tags              = var.tags
}

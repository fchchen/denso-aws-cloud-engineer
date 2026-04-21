data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# ---------- Ingest role ----------

resource "aws_iam_role" "ingest" {
  name               = "${var.project}-${var.environment}-ingest-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
  tags               = var.tags
}

data "aws_iam_policy_document" "ingest" {
  statement {
    sid     = "S3Write"
    actions = ["s3:PutObject"]
    resources = [
      "${var.raw_bucket_arn}/raw/*"
    ]
  }

  statement {
    sid       = "DynamoWrite"
    actions   = ["dynamodb:PutItem"]
    resources = [var.dynamodb_table_arn]
  }

  statement {
    sid = "Logs"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:${var.aws_region}:${var.account_id}:log-group:/aws/lambda/*"]
  }
}

resource "aws_iam_role_policy" "ingest" {
  name   = "ingest-policy"
  role   = aws_iam_role.ingest.id
  policy = data.aws_iam_policy_document.ingest.json
}

# ---------- Enrichment role ----------

resource "aws_iam_role" "enrichment" {
  name               = "${var.project}-${var.environment}-enrichment-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
  tags               = var.tags
}

data "aws_iam_policy_document" "enrichment" {
  statement {
    sid       = "S3Read"
    actions   = ["s3:GetObject"]
    resources = ["${var.raw_bucket_arn}/raw/*"]
  }

  statement {
    sid       = "S3WriteEnriched"
    actions   = ["s3:PutObject"]
    resources = ["${var.raw_bucket_arn}/enriched/*"]
  }

  statement {
    sid       = "DynamoUpdate"
    actions   = ["dynamodb:UpdateItem"]
    resources = [var.dynamodb_table_arn]
  }

  statement {
    sid = "Logs"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:${var.aws_region}:${var.account_id}:log-group:/aws/lambda/*"]
  }
}

resource "aws_iam_role_policy" "enrichment" {
  name   = "enrichment-policy"
  role   = aws_iam_role.enrichment.id
  policy = data.aws_iam_policy_document.enrichment.json
}

# ---------- Query role ----------

resource "aws_iam_role" "query" {
  name               = "${var.project}-${var.environment}-query-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
  tags               = var.tags
}

data "aws_iam_policy_document" "query" {
  statement {
    sid     = "DynamoQuery"
    actions = ["dynamodb:Query"]
    resources = [
      var.dynamodb_table_arn,
      "${var.dynamodb_table_arn}/index/TenantIndex"
    ]
  }

  statement {
    sid = "Logs"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:${var.aws_region}:${var.account_id}:log-group:/aws/lambda/*"]
  }
}

resource "aws_iam_role_policy" "query" {
  name   = "query-policy"
  role   = aws_iam_role.query.id
  policy = data.aws_iam_policy_document.query.json
}

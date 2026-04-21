terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = local.tags
  }
}

locals {
  tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = "platform-team"
    CostCenter  = "iot-platform"
  }
}

module "vpc" {
  source      = "./modules/vpc"
  project     = var.project
  environment = var.environment
  tags        = local.tags
}

module "dynamodb" {
  source      = "./modules/dynamodb"
  project     = var.project
  environment = var.environment
  tags        = local.tags
}

module "s3" {
  source      = "./modules/s3"
  project     = var.project
  environment = var.environment
  account_id  = var.account_id
  tags        = local.tags
}

# S3 notification wired here (not inside the s3 module) to break the
# circular dependency between s3 ↔ lambda modules.
resource "aws_s3_bucket_notification" "raw" {
  bucket = module.s3.raw_bucket_name

  lambda_function {
    lambda_function_arn = module.lambda.enrichment_function_arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "raw/"
    filter_suffix       = ".json"
  }

  depends_on = [module.lambda]
}

module "iam" {
  source             = "./modules/iam"
  project            = var.project
  environment        = var.environment
  account_id         = var.account_id
  aws_region         = var.aws_region
  raw_bucket_arn     = module.s3.raw_bucket_arn
  dynamodb_table_arn = module.dynamodb.table_arn
  tags               = local.tags
}

module "lambda" {
  source              = "./modules/lambda"
  project             = var.project
  environment         = var.environment
  aws_region          = var.aws_region
  raw_bucket_name     = module.s3.raw_bucket_name
  raw_bucket_arn      = module.s3.raw_bucket_arn
  dynamodb_table_name = module.dynamodb.table_name
  ingest_role_arn     = module.iam.ingest_role_arn
  enrichment_role_arn = module.iam.enrichment_role_arn
  query_role_arn      = module.iam.query_role_arn
  tags                = local.tags
}

module "api_gateway" {
  source              = "./modules/api_gateway"
  project             = var.project
  environment         = var.environment
  aws_region          = var.aws_region
  ingest_invoke_arn   = module.lambda.ingest_invoke_arn
  ingest_function_arn = module.lambda.ingest_function_arn
  query_invoke_arn    = module.lambda.query_invoke_arn
  query_function_arn  = module.lambda.query_function_arn
  tags                = local.tags
}

module "cloudfront" {
  source          = "./modules/cloudfront"
  project         = var.project
  environment     = var.environment
  api_gateway_url = module.api_gateway.invoke_url
  tags            = local.tags
}

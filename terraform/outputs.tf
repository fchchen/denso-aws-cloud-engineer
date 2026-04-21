output "cloudfront_url" {
  value       = "https://${module.cloudfront.distribution_domain}"
  description = "Public entry point for the API (use this for the simulator)"
}

output "api_gateway_url" {
  value       = module.api_gateway.invoke_url
  description = "Direct API Gateway URL (bypass CloudFront — for debugging only)"
}

output "api_key_id" {
  value       = module.api_gateway.api_key_id
  description = "API key ID — retrieve value with: aws apigateway get-api-key --api-key <id> --include-value"
}

output "dynamodb_table_name" {
  value = module.dynamodb.table_name
}

output "s3_bucket_name" {
  value = module.s3.raw_bucket_name
}

output "cloudfront_distribution_id" {
  value = module.cloudfront.distribution_id
}

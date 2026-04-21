output "api_id" { value = aws_api_gateway_rest_api.main.id }
output "invoke_url" { value = "https://${aws_api_gateway_rest_api.main.id}.execute-api.${var.aws_region}.amazonaws.com/${var.environment}" }
output "api_key_id" { value = aws_api_gateway_api_key.main.id }

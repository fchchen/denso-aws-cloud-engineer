output "ingest_function_arn"    { value = aws_lambda_function.ingest.arn }
output "ingest_invoke_arn"      { value = aws_lambda_function.ingest.invoke_arn }
output "consumer_function_arn"  { value = aws_lambda_function.consumer.arn }
output "enrichment_function_arn" { value = aws_lambda_function.enrichment.arn }
output "query_function_arn"     { value = aws_lambda_function.query.arn }
output "query_invoke_arn"       { value = aws_lambda_function.query.invoke_arn }

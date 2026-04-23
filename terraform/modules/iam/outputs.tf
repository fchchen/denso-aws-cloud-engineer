output "ingest_role_arn"     { value = aws_iam_role.ingest.arn }
output "consumer_role_arn"   { value = aws_iam_role.consumer.arn }
output "enrichment_role_arn" { value = aws_iam_role.enrichment.arn }
output "query_role_arn"      { value = aws_iam_role.query.arn }

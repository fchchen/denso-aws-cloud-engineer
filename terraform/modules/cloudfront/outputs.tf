output "distribution_domain" { value = aws_cloudfront_distribution.main.domain_name }
output "distribution_id" { value = aws_cloudfront_distribution.main.id }
output "origin_header_secret" { value = random_password.cf_secret.result }

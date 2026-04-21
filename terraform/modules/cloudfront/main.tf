resource "random_password" "cf_secret" {
  length  = 32
  special = false
}

locals {
  # Strip "https://" and trailing stage path from API GW URL for CF origin
  api_origin_id = "ApiGatewayOrigin"
  api_domain    = regex("https://([^/]+)", var.api_gateway_url)[0]
  api_path      = "/${var.environment}"
}

resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"
  comment         = "${var.project}-${var.environment}"

  origin {
    origin_id   = local.api_origin_id
    domain_name = local.api_domain
    origin_path = local.api_path

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "X-CF-Secret"
      value = random_password.cf_secret.result
    }
  }

  # Default (POST /v1/telemetry) — never cache writes
  default_cache_behavior {
    target_origin_id       = local.api_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["x-api-key", "x-tenant-id", "Authorization"]
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  # GET /v1/devices/* — cache reads for 30s
  ordered_cache_behavior {
    path_pattern           = "/v1/devices/*"
    target_origin_id       = local.api_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["x-api-key"]
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 30
    max_ttl     = 30
  }

  # GET /v1/health — cache 60s
  ordered_cache_behavior {
    path_pattern           = "/v1/health"
    target_origin_id       = local.api_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 60
    max_ttl     = 60
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = var.tags
}

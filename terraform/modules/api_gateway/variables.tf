variable "project" { type = string }
variable "environment" { type = string }
variable "aws_region" { type = string }
variable "ingest_invoke_arn" { type = string }
variable "ingest_function_arn" { type = string }
variable "query_invoke_arn" { type = string }
variable "query_function_arn" { type = string }
variable "tags" { type = map(string) }

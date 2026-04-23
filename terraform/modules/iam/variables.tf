variable "project"           { type = string }
variable "environment"       { type = string }
variable "account_id"        { type = string }
variable "aws_region"        { type = string }
variable "raw_bucket_arn"    { type = string }
variable "dynamodb_table_arn" { type = string }
variable "msk_cluster_arn"   { type = string }
variable "tags"              { type = map(string) }

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project" {
  type    = string
  default = "denso-vehicle-telemetry"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "account_id" {
  type = string
}

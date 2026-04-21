terraform {
  backend "s3" {
    bucket = "denso-tf-state-407043273463"
    key    = "vehicle-telemetry/terraform.tfstate"
    region = "us-east-1"
  }
}

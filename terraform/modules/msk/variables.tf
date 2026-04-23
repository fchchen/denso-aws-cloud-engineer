variable "project"     { type = string }
variable "environment" { type = string }
variable "subnet_ids"  { type = list(string) }
variable "kafka_sg_id" { type = string }
variable "tags"        { type = map(string) }

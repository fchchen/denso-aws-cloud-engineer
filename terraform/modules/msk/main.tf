resource "aws_msk_serverless_cluster" "telemetry" {
  cluster_name = "${var.project}-${var.environment}"

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.kafka_sg_id]
  }

  client_authentication {
    sasl {
      iam { enabled = true }
    }
  }

  tags = var.tags
}

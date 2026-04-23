output "cluster_arn"        { value = aws_msk_serverless_cluster.telemetry.arn }
output "bootstrap_brokers"  { value = aws_msk_serverless_cluster.telemetry.bootstrap_brokers_sasl_iam }

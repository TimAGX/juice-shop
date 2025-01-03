variable "cluster_name" {
  description = "The name of the ECS cluster"
  type        = string
}

variable "task_family" {
  description = "The ECS task family name"
  type        = string
}

variable "container_definitions" {
  description = "Container definitions in JSON format"
  type        = any
}

variable "requires_compatibilities" {
  description = "The launch type for the task (EC2 or Fargate)"
  type        = list(string)
}

variable "network_mode" {
  description = "The Docker networking mode to use for the containers"
  type        = string
}

variable "cpu" {
  description = "The number of CPU units used by the task"
  type        = string
}

variable "memory" {
  description = "The amount of memory (in MiB) used by the task"
  type        = string
}

variable "execution_role_arn" {
  description = "The ARN of the task execution role"
  type        = string
}

variable "task_role_arn" {
  description = "The ARN of the IAM role for the task"
  type        = string
}

variable "service_name" {
  description = "The name of the ECS service"
  type        = string
}

variable "desired_count" {
  description = "The number of tasks to run"
  type        = number
}

variable "subnets" {
  description = "The subnets to associate with the ECS tasks"
  type        = list(string)
}

variable "security_groups" {
  description = "The security groups to associate with the ECS tasks"
  type        = list(string)
}

variable "assign_public_ip" {
  description = "Whether to assign a public IP to the ECS tasks"
  type        = bool
}

variable "target_group_arn" {
  description = "The ARN of the target group for the service"
  type        = string
}

variable "container_name" {
  description = "The name of the container in the service"
  type        = string
}

variable "container_port" {
  description = "The port number on the container to connect to"
  type        = number
}

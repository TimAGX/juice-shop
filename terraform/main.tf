module "ecr" {
  source           = "./modules/ecr"
  repository_name  = "juiceshop_repo"
  image_scan_on_push = true
}

module "ecs" {
  depends_on = [ aws_lb.aws_lb765, aws_lb_target_group.target ]
  source                = "./modules/ecs"
  cluster_name          = "my-ecs-cluster"
  task_family           = "juiceshop-task"
  container_definitions = [
    {
      name      = "juiceShop"
      image     = module.ecr.repository_url
      cpu       = 256
      memory    = 512
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
    }
  ]
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.execution_role.arn
  task_role_arn            = aws_iam_role.task_role.arn
  service_name             = "juiceshop-service"
  desired_count            = 1
  subnets                  = aws_subnet.public[*].id
  security_groups          = [aws_security_group.ecs.id]
  assign_public_ip         = true
  target_group_arn         = aws_lb_target_group.target.arn
  container_name           = "juiceShop"
  container_port           = 3000
}


# IAM Role for ECS Task Execution
resource "aws_iam_role" "execution_role" {
  name = "ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "ecs-execution-role"
  }
}

# IAM Policy for Task Execution Role
resource "aws_iam_role_policy_attachment" "execution_role_policy" {
  role       = aws_iam_role.execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role for ECS Task
resource "aws_iam_role" "task_role" {
  name = "ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "ecs-task-role"
  }
}

resource "aws_lb" "aws_lb765" {
  name               = "test-lb-tf"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ecs.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  access_logs {
    bucket  = aws_s3_bucket.lb_logs.id
    prefix  = "elb-logs"
    enabled = true
  }

  tags = {
    Environment = "production"
  }
}

# ALB Target Group
resource "aws_lb_target_group" "target" {
  name     = "ecs-target-group"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.vpc765.id
  target_type = "ip"

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.aws_lb765.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target.arn
  }
}

resource "aws_s3_bucket" "lb_logs" {
  bucket = "lb-logs-test-bucket-123"

  tags = {
    Name        = "My bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_versioning" "lb_logs" {
  bucket = aws_s3_bucket.lb_logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lb_logs" {
  bucket = aws_s3_bucket.lb_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# First, set the bucket ownership to bucket owner enforced
resource "aws_s3_bucket_ownership_controls" "lb_logs" {
  bucket = aws_s3_bucket.lb_logs.id
  
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}


resource "aws_s3_bucket_policy" "lb_logs_policy" {
  bucket = aws_s3_bucket.lb_logs.id

  depends_on = [aws_s3_bucket_ownership_controls.lb_logs]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowELBLogDelivery"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::127311923021:root"  # ELB service account for us-east-1
        }
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.lb_logs.arn}/elb-logs/*"  # Match your ALB prefix
      }
    ]
  })
}

resource "aws_s3_bucket_public_access_block" "example" {
  bucket                  = "lb-logs-test-bucket-123" # Your bucket name
  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
}

data "aws_caller_identity" "current" {}
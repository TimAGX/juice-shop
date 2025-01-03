# VPC Configuration
resource "aws_vpc" "vpc765" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "secure-app-vpc"
  }
}

# Data Source for Availability Zones
data "aws_availability_zones" "available" {}

# Subnets Configuration
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.vpc765.id
  cidr_block              = cidrsubnet(aws_vpc.vpc765.cidr_block, 8, count.index)
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "secure-app-public-subnet-${count.index}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw_765" {
  vpc_id = aws_vpc.vpc765.id

  tags = {
    Name = "secure-app-igw"
  }
}

# Route Table for Public Subnet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.vpc765.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw_765.id
  }

  tags = {
    Name = "secure-app-public-route-table"
  }
}

# Associate Route Table with Subnets
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Group for ECS Fargate
resource "aws_security_group" "ecs" {
  vpc_id = aws_vpc.vpc765.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "secure-app-ecs-sg"
  }
}
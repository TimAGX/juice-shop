resource "aws_ecr_repository" "juiceshop_ecr" {
  name                 = var.repository_name
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = var.image_scan_on_push
  }
}

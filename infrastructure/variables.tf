variable "aws_access_key" {
  type = string
}
variable "aws_secret_key" {
  type = string
}

variable "region" {
  type    = string
  default = "eu-west-2"
}

variable "db_password" {
  type = string
}
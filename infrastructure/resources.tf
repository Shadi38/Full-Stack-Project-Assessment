

module "s3" {
  source      = "./s3"
  bucket_name = "reccomendationsh"
}

resource "aws_security_group" "recommendationEc2" {
  name        = "reccomendation_ec2_security_group"
  description = "Allow access to EC2"
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "example_server" {
  ami                    = "ami-0171207a7acd2a570"
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.recommendationEc2.id]
  key_name               = "my-new-key"

  tags = {
    Name = "reccomendationserver"
  }

  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = "ec2-user"
      host        = self.public_ip
      private_key = file("~/.ssh/my-new-key.pem")
    }

    inline = [
      "sudo yum update -y",
      "sudo yum install -y nodejs npm",
      "sudo npm update -y",
      "sudo yum install -y docker",
      "sudo systemctl start docker",
      "sudo systemctl enable docker"
    ]
  }
}

resource "aws_security_group" "recommendationRds" {
  name        = "reccomendation-rds_security_group"
  description = "Allow PostgreSQL access"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    # security_groups = [aws_security_group.recommendationEc2.id]
    security_groups = [aws_security_group.recommendationEc2.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}




resource "aws_db_instance" "default" {
  allocated_storage      = 10
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  db_name                = "recommendationDatabase"
  username               = "postgres"
  password               = var.db_password
  publicly_accessible    = true
  vpc_security_group_ids = [aws_security_group.recommendationRds.id]
  skip_final_snapshot    = true
  multi_az               = false

  tags = {
    Name = "RecommendationDatabase"
  }

  depends_on = [aws_security_group.recommendationEc2]  # Ensures EC2 security group is removed before the DB
}


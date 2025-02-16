# module "s3" {
#   source      = "./s3"
#   bucket_name = "reccomendationsh"
# }

# resource "aws_instance" "example_server" {
#   ami                    = "ami-0171207a7acd2a570"
#   instance_type          = "t2.micro"
#   vpc_security_group_ids = [local.recommendationRds_id]
#   # Adding the key_name  to attach the key pair during instance creation
#   key_name = "my-new-key"

#   tags = {
#     Name = "reccomendationserver"
#   }


#   provisioner "remote-exec" {
#     connection {
#       type        = "ssh"
#       user        = "ec2-user"
#       host        = self.public_ip //This means that the host IP address for the SSH connection should be the public IP of the EC2
#       private_key = file("~/.ssh/my-new-key.pem")

#     }
#     //ensures that npm and Docker are installed and running before deploying applications.
#     inline = [
#       "sudo yum update -y",             # Update system packages
#       "sudo yum install -y nodejs npm", # Install Node.js and npm
#       "sudo npm update -y",             # Update npm packages
#       "sudo yum install -y docker",     # Install Docker
#       "sudo systemctl start docker",    # Start Docker service
#       "sudo systemctl enable docker"    # Enable Docker to start on boot
#     ]
#   }
# }

# resource "aws_security_group" "recommendationRds" {
#   name        = "reccomendation_security_group"
#   description = "Allow ports 22, 8080, and 3000"

#   ingress {
#     from_port   = 5432
#     to_port     = 5432
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   ingress {
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"] # Allows SSH from anywhere
#   }

#   ingress {
#     from_port   = 8080
#     to_port     = 8080
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   ingress {
#     from_port   = 3000
#     to_port     = 3000
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
# }


# resource "aws_db_instance" "default" {
#   allocated_storage      = 10
#   engine                 = "postgres"
#   instance_class         = "db.t3.micro"
#   db_name                = "recommendation"
#   username               = "postgres"
#   password               = var.db_password
#   publicly_accessible    = true
#   vpc_security_group_ids = [local.recommendationRds_id]
#   skip_final_snapshot    = true // required to destroy
#   multi_az               = false
#   # Tags for organization (optional)
#   tags = {
#     Name = "RecommendationDatabase"
#   }
# }

module "s3" {
  source      = "./s3"
  bucket_name = "reccomendationsh"
}

# EC2 Security Group
resource "aws_security_group" "recommendationEc2" {
  name        = "reccomendation_ec2_security_group"
  description = "Allow ports 22, 8080, 3000 from anywhere"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allow SSH from anywhere (modify as needed)
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allow port 3000 from anywhere (modify as needed)
  }
  ingress {
    from_port   = 5432
    to_port     = 5432
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

# EC2 Instance
resource "aws_instance" "example_server" {
  ami                    = "ami-0171207a7acd2a570"
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.recommendationEc2.id] # Attach EC2 security group
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

# RDS Security Group
resource "aws_security_group" "recommendationRds" {
  name        = "reccomendation_security_group"
  description = "Allow port 5432 from EC2 security group"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.recommendationEc2.id] # Allow access from EC2 security group
  }
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allows SSH from anywhere
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
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

# RDS Instance
resource "aws_db_instance" "default" {
  allocated_storage      = 10
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  db_name                = "recommendation"
  username               = "postgres"
  password               = var.db_password
  publicly_accessible    = true
  vpc_security_group_ids = [aws_security_group.recommendationRds.id] 
  skip_final_snapshot    = true
  multi_az               = false
  tags = {
    Name = "RecommendationDatabase"
  }
}

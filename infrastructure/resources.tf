module "s3" {
  source      = "./s3"
  bucket_name = "reccomendationsh"
}

resource "aws_instance" "example_server" {
  ami                    = "ami-0171207a7acd2a570"
  instance_type          = "t2.micro"
  vpc_security_group_ids = [local.recommendationRds_id]
  # Add the key_name here to attach the key pair during instance creation
  key_name = "my-new-key"

  tags = {
    Name = "reccomendationserver"
  }

  #run commands on a remote machine after it has been created or updated
  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = "ec2-user"
      host        = self.public_ip //This means that the host IP address for the SSH connection should be the public IP of the EC2
      private_key = file("~/.ssh/my-new-key.pem")

    }
    //ensures that npm and Docker are installed and running before deploying applications.
    # inline = [
    #   "sudo npm update -y",
    #   "sudo npm install docker -y",
    #   "sudo systemctl start docker",
    #   "sudo systemctl enable docker"
    # ]
    inline = [
    "sudo yum update -y",  # Update system packages
    "sudo yum install -y nodejs npm",  # Install Node.js and npm
    "sudo npm update -y",  # Update npm packages
    "sudo yum install -y docker",  # Install Docker
    "sudo systemctl start docker",  # Start Docker service
    "sudo systemctl enable docker"  # Enable Docker to start on boot
  ]
  }
}

resource "aws_security_group" "recommendationRds" {
  name        = "reccomendation_security_group"
  description = "Allow ports 22, 8080, and 3000"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
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


resource "aws_db_instance" "default" {
  allocated_storage      = 10
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  db_name                = "recommendation"
  username               = "postgres"
  password               = var.db-password
  publicly_accessible    = true
  vpc_security_group_ids = [local.recommendationRds_id]
  skip_final_snapshot    = true // required to destroy

}


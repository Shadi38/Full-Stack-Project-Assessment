*Overall Architecture Diagram:

 Client (Browser)  --->(with HTTP Request)--->  S3 Bucket (Frontend - React) --->  API Gateway  --->   
 
 EC2 (Node.js Backend)Instance  --->  RDS (PostgreSQL) 


1-Docker Architecture:

Docker Container:
┌────────────────────────────┐
│ App (Node.js + Express)    │
│                            │
│ Exposes Port 3000          │
│ Connected to PostgreSQL DB │
└────────────────────────────┘

docker-compose.yml maps:

-Host port 3000 to container port 3000
-Image is shadi38/node-app:4.0



2-CI/CD Pipeline (GitHub Actions):

-Frontend CI/CD:
GitHub → GitHub Actions:
 ├── Checkout Code
 ├── Install Dependencies
 ├── Build React App
 └── Upload to S3 (Bucket: recommendationsh)

-Backend CI/CD (Node.js)
GitHub → GitHub Actions:
 ├── Build Docker Image
 ├── Push to DockerHub (shadi38/node-app:4.0)
 ├── Connect to EC2 via SSH
 │    ├── Stop & remove old container
 │    ├── Pull latest Docker image
 │    └── Run new container with .env file



3-Terraform Structure:

Terraform Scripts:
 ├── AWS Provider
 ├── EC2 Instance for Backend
 ├── Security Group (port 22 & 3000)
 ├── S3 Bucket for Frontend
 └── RDS PostgreSQL setup


                
                
                


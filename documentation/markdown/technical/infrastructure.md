---
title: Infrastructure Documentation
---



# Overview

The system is build to be hosted on AWS and uses the following services

**React-WebApp**

- hosted as a static website via an S3-Bucket

**Ktor-Backend**

- running as a .jar on an EC2-Instance

**Creating the Infrastructure**

- The whole infrastructure (ec2,s3,pipeline,roles,...) can be created (and deleted) via CloudFormation

**Deploying the Application**

- The back- and frontend can be built and deployed with their own pipeline (CodePipeline)
- The pipelines use CodeBuild, CodeDeploy and S3-Buckets for storing artifacts and logs

**(Secret) Configuration Files**

- i.e. configuration files that are not checked into git
- required files for building/deploying are saved in an s3 bucket and downloaded automatically by the build-process

**User Authentication**

- user authentication is handled by "AWS Cognito"
- "AWS Cognito" is NOT part of the automatic infrastructure stack handled by CloudFormation



# Setting up the Infrastructure

## Prerequisites

Required AWS-Resources that are not created with the CloudFormation stack

- **Certificate for WebApp**
  - An SSL-Certificate for the WebApp-Domain registered in "Amazon Certificate Manager"
  - Must be registered in region us-east-1
- **Certificate for API**
  - An SSL-Certificate for the API-Domain registered in "Amazon Certificate Manager"
  - Can be in any region
- **Domain + Hosted Zone**
  - A domain in AWS Route53 with a hosted zone

- **(Optional) Key-Pair for EC2-Instances**
  - a key-pair to use to ssl/scp into ec2-instances 

- **CodeStart-Github-Connection**
  - A connection to GitHub via CodeStar for the deployment-pipeline

- **S3-Bucket for "Secret" Configs**
  - S3-Bucket holding configuration files required for building that are not checked into git
  - Bucket-name = "strategy-game.config" with sub-directories "backend" and "frontend"

## Creating a new Infrastructure-Stack

The CloudFormation stack is defined in `./infrastructure/infrastructure-stack.yml`

A new stack can be created via ...

- the AWS-Console

  0. AWS-Console -> CloudFormation

  1. "Create Stack" -> "With new resources"
     - "Template is ready"
     - "Upload a template file" -> "Choose File" -> `./infrastructure/infrastructure-stack.yml`
  2. Choose a (unique) name for the new stack and check the parameters
  3. "Next" -> "Select check-box for capabilities" -> "Create Stack"

- the "tools"-script

  ```
  .\tools create infra
  ```

  - creates a new stack with default parameters

After the creation finished, the outputs of the stack contain the webapp-url, server-ip and other values. These can be displayed in the AWS-Console or via the "tools"-script with the following commands

- `.\tools print webappurl`
- `.\tools print serverip`
- `.\tools print serverid`



## Deleting an Infrastructure-Stack

- An existing infrastructure stack can be deleted via ...

  - the AWS-Console

    1. Manually empty all S3-Buckets created by the stack
    2. CloudFormation -> "Delete Stack" 

  - the "tools"-script

    ```
    .\tools delete infra
    ```

    - automatically empties all S3-Buckets and deletes the stack



# Connecting to the EC2-Instance

Securely connecting to an ec2-instance via ssh is done with AWS Instance Connect. The required cli can be installed with pip with the command `pip install ec2instanceconnectcli`.

Afterwards, connect to the instance with the following command:

```
mssh ubuntu@instanceid
```

- *instanceid*: is the id of the instance and can be viewed in the AWS-Console in the overview of the instance, in the CloudFormation-Outputs or with the "tools"-script with `.\tools print serverid`
  - Example: `mssh ubuntu@i-4879dfeba59ea8728`



# Deploying the Applications

## Executing the Deployment

The frontend and backend can be automatically build and deployed with their respective CodePipelines

- AWS-Console -> "CodePipeline" -> "Release change"

Or via the "tools"-script

- `.\tools deploy backend` triggers the pipeline for the backend
- `.\tools deploy frontend` triggers the pipeline for the frontend
- `.\tools deploy` triggers both pipelines for the backend and frontend

NOTE: check the (secret) production config-files for correctly configured aws urls/ips/... 

## Handling "secret" Config-Files

"Secret" configuration files that are not checked into git and are required for production builds are stored in an s3-bucket ("strategy-game.config"). The pipeline download the required files before building the artifacts.

The files can either be uploaded manually via the AWS-Console or with the "tools"-script

- `.\tools push secrets` uploads all current local secret files (production-files only) to the s3-bucket (overwriting already existing files)
- `.\tools pull secrets` downloads all secret files from the s3-bucket and overwrites already existing local files (production-files only)

## Manual Deployment

### Frontend

Build the application and upload the contents of the "dist"-directory to the S3-Bucket

### Backend

Note: A valid key-pair is required to connect to the instance via scp !

1. Upload the .jar file

   ```
   scp -i "path\to\ec2-kp.pem" path\to\strategy-game-backend.jar ubuntu@<host>:/home/ubuntu
   ```

2. connect via ssh to the instance

3. start the jar in the background

   ```
   sudo java -jar *.jar prod > /dev/null 2> /dev/null < /dev/null &
   ```

   

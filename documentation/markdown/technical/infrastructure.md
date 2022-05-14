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

## The Template-File

The infrastructure-stack is defined and configured in `./infrastructure/infrastructure-stack.yml`

**Parameters**

- *EnvName*

  - Name of the created environment added to the names of all created resources (or an empty string). Example: EnvName = "-testing" => all resources start with "strategy-game*-testing*"

  - Default: ""

- *GitBranch*

  - Name of the git-branch to use for building (and deployment)
  - Default: "develop"
  - Type: String

- *GithubCodeStarConnectionArn*

  - Amazon Resource Name (ARN) of the already created Codestar-connection to GitHub. This connection is required but not created with the CloudFormation-tempalte 
  - Default: the arn of an already created connection

## Creating a new Infrastructure-Stack

A new infrastructure stack can be created via ...

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

  - creates a new stack with default parameters+

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


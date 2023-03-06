---
title: Infrastructure Documentation
---



# Setting up the Infrastructure

## Prerequisites

Required AWS-Resources that are not created with the CloudFormation stack

- **Certificate for WebApp**
  - An SSL-Certificate for the WebApp-Domain registered in "Amazon Certificate Manager"
  - Must be registered in region us-east-1
- **Domain + Hosted Zone**
  - A domain in AWS Route53 with a hosted zone
- **CodeStart-Github-Connection**
  - A connection to GitHub via CodeStar for the deployment-pipeline
- **Kubernetes-Cluster**
  - The whole system (except the frontend) can be run in a Kubernetes-Cluster. The setup for this is currently not automated
  - more information can be found here: [Kubernetes Cluster](./kubernetes_cluster.md)
  - All resources/config-files required to setup a cluster using Kops, aswell as deploying the whole system can be found in the `/infrastructure/kubernetes`-directory




## AWS-Cloudformation Stacks

The complete infrastructure can be created by "AWS CloudFormation". Several stacks exist in the "/infrastructure/aws"-directory:

### Base-Stack

- `cf-base.yml`

- Infrastructure stack that is only created once and contains common config/services

- contains for example the AWS ECR, common logging S3-Buckets, ...

### Frontend-Stack

- `frontend/cf-frontend.yml`
- Infrastructure to run/host the frontend 
- contains for example the S3-Bucket, Cloudfront-setup, Route53-entry, ...

### Backend Build-Pipeline

- `buildpipeline/cf-build-pipeline-backend.yml`
- infrastructure to automatically build and deploy the backend

### Frontend Build-Pipeline

- `buildpipeline/cf-build-pipeline-frontend.yml`
- infrastructure to automatically build and deploy the frontend



## Creating a new Infrastructure-Stack

The CloudFormation stacks are defined in `./infrastructure/aws/...`

A new stack can be created via the AWS-Console

0. AWS-Console -> "CloudFormation"

1. "Create Stack" -> "With new resources"
   - "Template is ready"
   - "Upload a template file" -> "Choose File" -> `./infrastructure/infrastructure-stack.yml`
2. Choose a (unique) name for the new stack and check the parameters
3. "Next" -> "Select check-box for capabilities" -> "Create Stack"



## Deleting an Infrastructure-Stack

- An existing infrastructure stack can be deleted via the AWS-Console

  1. Manually empty all S3-Buckets created by the stack
2. "CloudFormation" -> "Delete Stack" 



# Deploying the Applications

## Executing the Deployment

The frontend and backend can be automatically build and deployed with their respective CodePipelines

- AWS-Console -> "CodePipeline" -> "Release change"

**Pipelines**

- `strategy-game.backend.release` - the backend deployment of the "release"-branch
- `strategy-game.backend.develop` - the backend deployment of the "develop"-branch
- `strategy-game.backend.deployment-marker` - the backend deployment of the "deployment-marker"-branch. Hard-reset this branch to any commit.
- `strategy-game.frontend.release` - the frontenddeployment of the "release"-branch
- `strategy-game.frontend.develop` - the frontenddeployment of the "develop"-branch
- `strategy-game.frontend.deployment-marker` - the frontenddeployment of the "deployment-marker"-branch. Hard-reset this branch to any commit.

**⚠ Note (@March 2023)**

The backend is currently not "deployed" - only the docker image pushed into the private AWS Container Registry 




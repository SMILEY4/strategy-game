# Infrastructure

The infrastructure-directory contains the following sub-directories

- */aws* - all configuration specific to aws  - mostly cloudformation-stacks to create aws resources
- */backend* - all files required to run the backend-application in a docker-swarm- e.g. docker-compose.yml and config-files
- */local* - all files required to run the application locally (e.g. docker-compose.yml). Similar to "/backend" but with a more simplified/minimal setup.

## AWS Cloudformation Stacks

AWS resources are created via Cloudformation.

### Resources not included in stacks

Required AWS-Resources that are not created with any CloudFormation-stack

- *Certificate for WebApp*
  - An SSL-Certificate for the WebApp-Domain registered in "Amazon Certificate Manager"
  - Must be registered in region us-east-1
- *Domain + Hosted Zone*
  - A domain in AWS Route53 with a hosted zone
- *CodeStart-Github-Connection*
  - A connection to GitHub via CodeStar for the deployment-pipeline
- *Instance Key-Pair*
  - A key to access ec2-instances

### cf-base.yml

Creates the following base resources:

- *DockerRepository* - the private ecr docker-repository
- *config-bucket* - s3 bucket holding some config files required by some applications
- *log and artifact s3-buckets* - s3-buckets holding logs and (temporary) artifacts

### backend/cf-docker-swarm-base.yml

Creates the following resources required to run a docker-swarm on aws:

- *SwarmConfigBucket* - s3 bucket containing scripts and configuration required to setup and run the docker-swarm (not the actual application) - i.e. contains the setup and deploy scripts
- *DeploymentArtifactBucket* - s3 bucket containing .zip-files with the necessary files and configuration to deploy the backend system (e.g. docker-compose-file, Caddyfile, ...)
- *SecurityGroups* -  the security-group for the ec2-instances running the docker-swarm (master and workers). Allows communication between the instances and exposes only the ports required for the application to the public (i.e. 80, 443, 22)
- *MasterInstanceRole, Profile* - the iam-role and profile for the docker-swarm-master ec2-instances
- *WorkerInstanceRole, Profile* - the iam-role and profile for the docker-swarm-worker ec2-instances

### backend/cf-docker-swarm-master.yml

Creates the following resources to create the docker-swarm master-node:

- *Instance* - the ec2-instance configured as a docker-swarm-master. Installs all required dependencies and downloads the setup and deploy scripts from the `strategy-game.swarm`-bucket

No additional manual setup is required. Only one master-node should exist at once.

Two scripts are downloaded from the  `strategy-game.swarm`-bucket:

- *setup.py* - automatically run during ec2-creation. Executes some addition setup for the swarm, e.g. creating docker secrets.
- *deploy.py* - used to deploy the system on the swarm. Has to be executed manually. 

### backend/cf-docker-swarm-worker.yml

Creates the following resources to create a single docker-swarm worker-node:

- *Instance* - the ec2-instance configured as a docker-swarm-worker. Installs all required dependencies.

The worker instance must be manually connected to the master-node.

- ssh into the master node and get the connection-command

  ```bash
  docker swarm join-token worker
  ```

- ssh into the created worker node and run the command to join the swarm

### frontent/cf-frontend.yml

Creates the following resources to host the webapp:

- *WebAppBucket* - the public s3-bucket hosting the webapp
- *BasicAuthFunction* - a (javascript) cloudfront-function adding basic-auth to the webapp. The username and password are hardcoded in this code/cloudformation-file. This auth it NOT meant to protect secure data, but to prevent bots from easily crawling the page!
- *CloudFrontDistribution* - the setup of the cloudfront-cdn including tls
- *Route53Records* - the route53-record

### buildpipeline/cf-build-pipeline-backend.yml

Creates the following resources to create a aws code-pipeline for the backend application:

- *IAM-Roles* - all required iam-roles
- *CodeBuildBackend* - the code-build project running the buildspec.yml and building the backend and uploading the docker image to ECR
- *PipelineBackendDeploymentMarker* - the pipeline building the backend. Uses the git `deployment-marker`-branch 
- *PipelineBackendDevelop* - the pipeline building the backend. Uses the git `develop`-branch 
- *PipelineBackendRelease* - the pipeline building the backend. Uses the git `relese`-branch 

The codebuild-project uses the "buildspec-backend.yml". It build the backend docker-image and uploads it to ECR tagged as "latest" and an another identifying tag. this tag is either the value of a git-tag (if present) at the checked-out commit or a short form of the commit-hash

### buildpipeline/cf-build-pipeline-frontend.yml

Creates the following resources to create a aws code-pipeline for the frontend application:

- *IAM-Roles* - all required iam-roles
- *CodeBuildProjectFrontend* - the code-build project running the buildspec.yml and building the webapp-artifact
- *PipelineFrontendDeploymentMarker* - the pipeline building the webapp. Uses the git `deployment-marker`-branch 
- *PipelineFrontendDevelop* - the pipeline building the webapp. Uses the git `develop`-branch 
- *PipelineFrontendRelease* - the pipeline building the webapp. Uses the git `relese`-branch 

The codebuild-project uses the "buildspec-frontend.yml". It builds the webapp-artifact. The pipeline then deploys the webapp to the specified (public) s3-bucket



## Deploying the Infrastructure

**1. Create the common base resources**

- create a new cloudformation stack from "/aws/cf-base.yml"
- upload the frontend environment files ".env.local" and ".env.production.local" to the "strategy-game.config"-s3-bucket (in the directory "frontend")
- upload the files "aws/backend/setup.py" and "aws/backend/deploy.py" to the "strategy-game.config"-s3-bucket (in the directory "swarm")

**2. Create the frontend resources**

- create a new cloudformation stack from "/aws/frontend/cf-frontend.yml"

**3. Create the frontend build-pipeline**

- create a new cloudformation stack from "/aws/buildpipeline/cf-build-pipeline-frontend.yml"
- ⚠ AWS CodeBuild takes the buildspec from the specified branch of the git-repository
- ⚠ AWS CodePipelines automatically start after creation -> manually stop started pipelines 

**4. Create the backend docker-swarm base stack**

- create a new cloudformation stack from "/aws/backend/cf-docker-swarm-base.yml"

**5. Create the backend docker-swarm master-instance stack**

- create a new cloudformation stack from "/aws/backend/cf-docker-swarm-master.yml"
  - enter the ec2-instance-type when creating the stack

**6. (optional) Create backend docker-swarm- worker-instance stacks**

- create a new cloudformation stack from "/aws/backend/cf-docker-swarm-worker.yml"
  - enter the ec2-instance-type when creating the stack
  - enter the instance name when creating multiple stacks
- manually connect the worker-instance to the swarm
  - ssh into the master instance and run `docker swarm join-token worker`. The command returns the join-command for worker-instances
  - ssh into the worker instance(s) and execute the returned join-command
  - verify worker nodes: ssh into the master instance and run `docker node ls` to list all nodes (incl. master node)

**7. Create the backend build-pipeline**

- create a new cloudformation stack from "/aws/buildpipeline/cf-build-pipeline-backend.yml"
- ⚠ AWS CodeBuild takes the buildspec from the specified branch of the git-repository
- ⚠ AWS CodePipelines automatically start after creation -> manually stop started pipelines 





## Deploying the Frontend

The frontend can be deployed completly automatically with CodePipelines.

- `strategy-game.frontend.release` - the deployment of the "release"-branch
- `strategy-game.frontend.develop` - the deployment of the "develop"-branch
- `strategy-game.frontend.deployment-marker` - the deployment of the "deployment-marker"-branch. Hard-reset this branch to any commit.

The respective git-branch is checked out, the webapp is built and deployed to the public s3-bucket



## Deploying the Backend

The deployment of the backend involves multiple steps

**1. Building the docker image and pushing to ECR**

The docker image can be built manually or with a respective CodePipeline

- `strategy-game.backend.release` - the deployment of the "release"-branch
- `strategy-game.backend.develop` - the deployment of the "develop"-branch
- `strategy-game.backend.deployment-marker` - the deployment of the "deployment-marker"-branch. Hard-reset this branch to any commit.

**2. Uploading a deployment artifact to s3**

A .zip-file containing the docker-compose-file and other config-files has to be uploaded to the s3-bucket. The docker-compose.yml must reference a docker image that exists in ECR. the docker compose-file must be a top-level file in the zip-archive.

The .zip-archive must have a name matching the following schema: `artifact_<tag>.zip`. "tag" is any string identifying the archive (e.g. "latest", "0.4.1", "a125efc", ...).

**3. running the deployment-script**

A deploy.py script was automatically downloaded to the docker-swarm master instance at when creating the instance.

Connect to the swarm-master via ssh and execute the "deploy.py"-script with the following arguments:

- the tag of the artifact-archive uploaded in step 2 to use for the deployment (e.g. "latest", "0.4.1", "a125efc", ...). 

 

## Accessing non-exposed apps in docker-swarm

Apps (e.g. grafana, prometheus) that are running on ports that are not publicly exposed can be accessed via ssh-tunnels

```bash
ssh -i [./pathToKey.pem] ubuntu@[Public IPv4 DNS] -N -L [localport]:[Public IPv4 DNS]:[remotePort]
```

- *pathToKey* - the .pem-file used to access the ec2-instance
- *Public IPv4 DNS* - the public IPv4 DNS of the instance to access, i.e. "ec2-xxx-xxx.xxx.xxx.eu-central-1.compute.amazonaws.com"
- *remotePort* - the port of the instance the application is running on
- *localPort* - the local port to bind the app to

The app can then be accessed on "http://localhost:[localport]" 

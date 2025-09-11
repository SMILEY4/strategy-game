# Strategy-Game AWS Infrastructure

Contains AWS infrastructure for server, static resource and container repository as cloudformation stacks.

Stacks have to be created in a specific order (and deleted in reverse order)

- 1. `cf-base.yml` - contains common resources independent of server deployments
- 2. `cf-frontend.yml` - contains resources for the frontend
- 2. `cf-backend.yml` - contains resources for the backend


## Base Resources

`cf-base.yml`

Creates common resources for infrastructure, frontend and backend. Should be created only once and not be re-created.

**Pre-Requirements**

 - none

**Created Resources**

 - private Elastic Container Registry


## Frontend Resources

`cf-frontend.yml`

Creates resources required for the frontend application.

**Pre-Requirements**

- An SSL-Certificate for the WebApp-Domain registered in "Amazon Certificate Manager". Must be registered in region us-east-1.
- Hosted Zone in AWS Route 53

**Created Resources**

- S3-Bucket for webapp
- Cloudfront CDN with basic-auth function
- Route53 Record pointing to webapp (cdn)


## Backend Resources

Creates resources required for the backend application.

**Pre-Requirements**

- Hosted Zone in AWS Route 53
- Key-Pair for EC2 instance

**Created Resources**

- EC2 instance as backend server
- Route53 Record pointing to ec2 instance


## Infrastructure Deployment

The AWS Cloudformation stacks can be created and deleted via the AWS Console in the browser.


## Application Deployment

The frontend and backend can be build and deployed via the corresponding GitHub actions.


## SSH-Tunnel into EC2 Instance

Apps (e.g. grafana, prometheus) that are running on ports that are not publicly exposed can be accessed via ssh-tunnels:

```bash
ssh -i [./pathToKey.pem] ubuntu@[Public IPv4 DNS] -N -L [localport]:[Public IPv4 DNS]:[remotePort]
```

- *pathToKey* - the .pem-file used to access the ec2-instance
- *Public IPv4 DNS* - the public IPv4 DNS of the instance to access, i.e. "ec2-xxx-xxx.xxx.xxx.eu-central-1.compute.amazonaws.com"
- *remotePort* - the port of the instance the application is running on
- *localPort* - the local port to bind the app to

The app can then be accessed on "http://localhost:[localport]" 

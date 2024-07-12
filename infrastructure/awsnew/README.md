# Strategy-Game AWS Infrastructure

Contains AWS infrastructure for server, static resource and container repository as cloudformation stacks.

Stacks have to be created in a specific order (and deleted in reverse order)

- 1. `cf-base.yml` - contains common resources independent of server deployments
- 2. `cf-frontend.yml` - contains resources for the frontend
- 2. `cf-backend.yml` - contains resources for the backend


### Pre-Requirements

**cf-base.yml**

- none


**cf-frontend.yml**

- tls certificate for webapp in AWS Certificate Manager
- Hosted Zone in AWS Route 53

**cf-backend.yml**

- Hosted Zone in AWS Route 53
- Key-Pair for EC2 instance
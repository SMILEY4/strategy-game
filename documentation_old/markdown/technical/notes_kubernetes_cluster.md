---
title: Notes: Kubernetes Cluster on AWS EC2
---

# Notes: Kubernetes Cluster on AWS EC2 using Kops



## Used Resources

- https://www.youtube.com/watch?v=G_GAPgyJ_00

  - main video tutorial

- https://kops.sigs.k8s.io/getting_started/aws/

  - "Getting Started with kOps on AWS"

- https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/

  - "Run a Stateless Application Using a Deployment"
  
- https://michalwojcik.com.pl/2021/08/08/ingress-tls-in-kubernetes-using-self-signed-certificates/

  - ingress & tls

    


## Process

### 1. Setup dedicated IAM user for Kops

- create the kops-user

    ```powershell
    aws iam create-group --group-name kops

    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonRoute53FullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/IAMFullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonSQSFullAccess --group-name kops
    aws iam attach-group-policy --policy-arn arn:aws:iam::aws:policy/AmazonEventBridgeFullAccess --group-name kops

    aws iam create-user --user-name kops

    aws iam add-user-to-group --user-name kops --group-name kops

    aws iam create-access-key --user-name kops
    ```

- remember the user credentials (output of the last command) 

- create local kops-user

    ```powershell
    aws configure --profile kops
    ```

    - with the credentials of the created kops-user
    
- specify which profile kops should use

    ```powershell
    $AWS_PROFILE='kops'
    ```

      

### 2. Create S3-Bucket for cluster-configuration

- create the s3-bucket

    ```powershell
    aws s3api create-bucket --bucket strategy-game.cluster --region eu-central-1 --create-bucket-configuration LocationConstraint=eu-central-1 --profile kops
    ```

- enable versioning

  ```powershell
  aws s3api put-bucket-versioning --bucket strategy-game.cluster  --versioning-configuration Status=Enabled --profile kops
  ```

### 3. Set temporary env-variables to simplify commands

- name of the cluster

    ```powershell
    $NAME='strategy-game.k8s.local'
    ```

	- must end on `.k8s.local` for a gossip-based cluster

- s3 bucket for the cluster config

    ```powershell
    $KOPS_STATE_STORE='s3://strategy-game.cluster'
    ```
    
    - name of the created s3-bucket

### 4. Create the cluster configuration

- list all availability-zone

  ```powershell
  aws ec2 describe-availability-zones --region eu-central-1
  ```

  - choose one, e.g. `eu-central-1a`

- only creates the configuration in the s3-bucket (does not yet create the cluster)

  ```powershell
  kops create cluster --name=$NAME --cloud=aws --zones=eu-central-1a --state=$KOPS_STATE_STORE
  ```

- edit cluster

  ```powershell
  kops edit cluster --name=strategy-game.k8s.local --state=$KOPS_STATE_STORE
  ```

- edit master node

  ```powershell
  kops edit ig --name=$NAME master-eu-central-1a --state=$KOPS_STATE_STORE
  ```

- edit worker node

  ```powershell
  kops edit ig --name=$NAME nodes-eu-central-1a --state=$KOPS_STATE_STORE
  ```



### 5. Creating the Cluster

- create the aws resources from the config in s3

  ```powershell
  kops update cluster --name=$NAME --state=$KOPS_STATE_STORE --yes
  ```

- set kubectl context to created cluster (otherwise unauthorized)

  ```powershell
  kops export kubecfg --admin --state=$KOPS_STATE_STORE
  ```

- validate the cluster / check status

  ```
  kops validate cluster --state=$KOPS_STATE_STORE
  ```

### 6. Create a deployment

- create nginx deployment based on remote YAML file

  ```powershell
  kubectl apply -f https://k8s.io/examples/application/deployment.yaml
  ```

- view currently running pods 

  ```
  kubectl get pods
  ```

- expose the deployed service

  ```powershell
  kubectl expose deployment nginx-deployment --type=LoadBalancer --name=my-service
  ```

  - view status and external ip

  ```
  kubectl get svc
  ```

  - one ready, open page in browser with external ip

### 7. Delete cluster

- delete the cluster and all resources (expect s3 bucket)

  ```powershell
  kops delete cluster --name=$NAME --state=$KOPS_STATE_STORE --yes
  ```

  



# Miscellaneous



## Switch kubectl context

- list known contexts

  ```powershell
  kubectl config get-contexts
  ```

- set context

  ```powershell
  kubectl config set current-context MY-CONTEXT
  ```

  



## Setup Basic Ingress

1. create ingress controller (only/specific for docker desktop ?)

   ```powershell
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.6.4/deploy/static/provider/cloud/deploy.yaml
   ```

   - wait until ready

     ```powershell
     kubectl get pods --namespace=ingress-nginx
     ```

2. create ingress

   ```powershell
   kubectl apply -f ingress.yml
   ```

   ```yaml
   #ingress.yml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
       name: ingress
       namespace: strategy-game
       labels:
           name: ingress
   spec:
       ingressClassName: nginx # must match metadata.name of "type:IngressClass" in yml from step 1
       rules:
           -   http:
                   paths:
                       -   path: /
                           pathType: Prefix
                           backend:
                               service:
                                   name: app # metadata.name of target app
                                   port:
                                       number: 8080 ## target port
   
   ```

3. wait for ingress (should have public address when done)

   ```powershell
   kubectl get ingress --namespace=strategy-game
   ```

4. ingress and services now publicly available via addess



## Setup TLS with ingress

- generate self signed certificate

  ```powershell
  openssl req -x509 -newkey rsa:4096 -sha256 -nodes -keyout tls.key -out tls.crt -subj "/CN=ingress.local" -days 365
  ```

- create new kubernetes secret for generated certificate

  ```powershell
  kubectl create secret tls ingress-local-tls --cert=tls.crt --key=tls.key
  ```

- add tls to ingress (yaml-file with "kind: Ingress"), add/update following lines

  ```yaml
  spec:
      tls:
          -   hosts:
                  - ingress.local # name of the cert. subj
              secretName: ingress-local-tls #  name of the create secret
  ```



## Setup credentials to pull docker images from ECR

- get username, password, server

  ```
  aws ecr get-login --no-include-email --region eu-central-1
  ```

  - result

  ```powershell
  docker login -u AWS -p eyJwYXlsb2F...zgzNzI4fQ== https://627717213620.dkr.ecr.eu-central-1.amazonaws.com
  ```
  
  - user (-u) = "AWS"
  - password (-p) = "eyJwYXlsb2F...zgzNzI4fQ=="
  - server (last part) = "https://627717213620.dkr.ecr.eu-central-1.amazonaws.com"
  
- create kubernetes secret

  ```powershell
  kubectl create secret docker-registry ecr \
  --docker-username=AWS \
  --docker-password=eyJwYXlsb2F...zgzNzI4fQ== \
  --docker-server=https://627717213620.dkr.ecr.eu-central-1.amazonaws.com \
  --namespace=health-check-service
  ```

- tell kubernetes to use ecr and secrets in "deployment.yml" (add/update following lines)

  ```yaml
          spec:
              containers:
                      image: url.to.ecr:image:tag
                      imagePullPolicy: Always
              imagePullSecrets:
                  -   name: regcred
  ```

  

### Access Service via Port Forwarding

- get service name and port

  ```powershell
  kubectl get svc --namespace=strategy-game
  ```

- port-forward local port to service port

  ```powershell
  kubectl port-forward service/SERVICENAME SERVICEPORT:LOCALPORT --namespace=strategy-game
  ```

- Note: can also port-forward to pods, etc ...

  ```powershell
  kubectl port-forward pod/PODNAME ...
  ```

  

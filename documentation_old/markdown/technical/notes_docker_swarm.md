---
title: Notes: Docker-Swarm
---



# Notes: Docker Swarm

1. create 2 ec2 instances (ubuntu, default vpc, ...)

   - name one e.g. "swarm-master"
   - name the other(s) e.g. "swarm-worker"

2. ssh into all instances

3. setup all instances

   ```bash
   sudo apt-get update
   sudo apt install docker.io -y
   ```

4. setup docker without sudo (REQUIRED among others for ecr-credentials-helper!!)

   - https://docs.docker.com/engine/install/linux-postinstall/

5. install + setup ecr-credentials-helper

   1. https://github.com/awslabs/amazon-ecr-credential-helper

6. get private-ip of master instance (ec2-overview)

7. in master instance

   - init instance as master-node

   ```bash
   docker swarm init --advertise-addr "PRIVATE_IP:2377"
   ```

   - prints command used for workers to join cluster

8. in all worker nodes

   - paste+run command provided by initializing master
   - to get new join-command `docker swarm join-token worker`

9. check cluster

   ```bash
   docker node ls # to print all connected nodes
   docker service ls # to print all running services
   ```

10. run sample service (hello-world-nginx)

   ```bash
   #START
   docker service create --replicas 1 -p 80:80 --name nginx-hello nginxdemos/hello
   
   # STOP
   docker service rm nginx-hello 
   ```

   - access in browser via public-ip of master-node

#### Notes

- create secrets: `echo "my secret value" | sudo docker secret create my_secret -`

  ```bash
  #for backend app
  echo "SECRET_VALUE" | sudo docker secret create awsSecretAccessKey -
  echo "SECRET_VALUE" | sudo docker secret create adminPassword -
  ```

- deploy stack: `docker stack deploy --compose-file docker-compose.yml stackname`

  ```bash
  docker stack deploy --compose-file docker-compose.yml stackname
  ```

  - observation:   image from ecr has to be pulled manually / cannot be pulled by workers -> auth ?
  
    ```bash
    docker stack deploy --with-registry-auth ...
    ```
  
- debug why service didnt start

  ```bash
  docker service logs {servicename}
  ```

  ```bash
  docker service ps --no-trunc {serviceName}
  ```

- tunnel to ec2 to access apps with ports not exposed via security-group or similar

  ```bash
  ssh -i [./pathToKey.pem] ubuntu@[Public IPv4 DNS] -L [localport]:[Public IPv4 DNS]:[remotePort]
  ```



# Jenkins

1. install: https://pkg.jenkins.io/debian/

2. install java and docker

3. add jenkins user to docker-group

   ```
   sudo usermod -a -G docker jenkins
   system
   ```

4. open jenkins ui publicIp:8080

5. (initial) admin password can be found here

   ```
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```

    
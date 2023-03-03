[TOC]

# Application Setup



## Base Setup

### Namespace

- all strategy-app objects live in the "strategy-app" namespace (exept the ingress-controller)

  ```powershell
  kubectl apply -f .\base\namespace.yml
  ```

### Ingress Controller and Ingress

- create ingress controller

  ```powershell
  kubectl apply -f .\base\ingress_controller.yml
  ```

  - for docker desktop, the pod might not start, run instead:

    ```powershell
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.0.4/deploy/static/provider/cloud/deploy.yaml
    ```

- if external-ip infinite "pending" status with docker desktop: check if port 80 is being blocked

  - https://stackoverflow.com/questions/48198/how-do-i-find-out-which-process-is-listening-on-a-tcp-or-udp-port-on-windows
  - restarting docker-desktop might solve it

- create ingress

  - without tls-termination, useful for local testing

    ```
    kubectl apply -f .\base\ingress_no_tls.yml
    ```

  - with tls-termination

    - generate (self signed) certificate

      ```powershell
      openssl req -x509 -newkey rsa:4096 -sha256 -nodes -keyout tls.key -out tls.crt -subj "/CN=ingress.local" -days 365
      ```

    - create new kubernetes secret for generated certificate

      ```powershell
      kubectl create secret tls ingress-local-tls --cert=tls.crt --key=tls.key
      ```

    - create ingress using certificate from secret

      ```powershell
      kubectl apply -f .\base\ingress.yml
      ```

- check state of ingress

  ```powershell
  kubectl get ingress --namespace=strategy-game
  ```

  ready when "address" is provided (may take some time)

  - "localhost" when running locally e.g. in Docker Desktop
  - public url (of load balancer) when running in AWS





##  Application Setup

### Database

```powershell
kubectl apply -f .\application\database.yml
```

### Application

- when using local images

  ```
  kubectl apply -f .\application\application_local_image.yml
  ```

- when using images from AWS ECR

  - get username, password, server

    - aws ecr get-login --no-include-email --region eu-central-1


    - result
    
      ```powershell
      docker login -u AWS -p eyJwYXlsb2F...zgzNzI4fQ== https://627717213620.dkr.ecr.eu-central-1.amazonaws.com
      ```
    
      - user (-u) = "AWS"
    
      - password (-p) = "eyJwYXlsb2F...zgzNzI4fQ=="
    
      - server (last part) = "https://627717213620.dkr.ecr.eu-central-1.amazonaws.com"

  - create kubernetes secret with ecr credentials

    ```powershell
    kubectl create secret docker-registry ecr \
    --docker-username=AWS \
    --docker-password=eyJwYXlsb2F...zgzNzI4fQ== \
    --docker-server=https://627717213620.dkr.ecr.eu-central-1.amazonaws.com \
    --namespace=health-check-service
    ```

  - start application

    ```powershell
    kubectl apply -f .\application\application.yml
    ```

    

## Monitoring/Metrics Setup

### Prometheus

```powershell
kubectl apply -f .\metrics\prometheus.yml
```

- to access prometheus-ui

  ```powershell
  kubectl port-forward service/prometheus localport:9090 --namespace=strategy-game
  ```

  - available at `http://localhost:<localport>`

### Grafana

```powershell
kubectl apply -f .\metrics\grafana.yml
```

- to access grafana-ui

  ```
  kubectl port-forward service/grafana localport:3000 --namespace=strategy-game
  ```

  - available at `http://localhost:<localport>`
  - default login credentials are username="admin", password="admin"
  - to create overview dashboard: "dashboards" -> "import dashboard" -> select "metrics/grafana_dashboard.json" -> "import"



### Logging Setup

### Elasicsearch

```powershell
kubectl apply -f .\logging\elasticsearch.yml
```

### Filebeat

```powershell
kubectl apply -f .\logging\filebeat.yml
```

### Kibana

```powershell
kubectl apply -f .\logging\kibana.yml
```

- to access kibana-ui

  ```powershell
  kubectl port-forward service/kibana localport:5601 --namespace=strategy-game
  ```

  - available at `http://localhost:<localport>`
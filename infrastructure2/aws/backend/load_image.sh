#!/usr/bin/env bash

set -e

aws ecr get-login-password --region eu-central-1 | sudo docker login --username AWS --password-stdin 627717213620.dkr.ecr.eu-central-1.amazonaws.com
sudo docker pull 627717213620.dkr.ecr.eu-central-1.amazonaws.com/strategy-game:latest
sudo docker tag 627717213620.dkr.ecr.eu-central-1.amazonaws.com/strategy-game:latest strategy-game:latest
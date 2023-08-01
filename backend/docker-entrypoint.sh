#! /bin/bash

export AWS_SECRET_ACCESS_KEY=$(cat /var/run/secrets/secretAccessKey)
export ADMIN_PASSWORD=$(cat /var/run/secrets/adminPassword)

java -jar /app/strategy-game.jar prod
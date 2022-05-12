#!/usr/bin/env bash
echo Starting server
cd /home/ubuntu/server
sudo java -jar *.jar prod > /dev/null 2> /dev/null < /dev/null &
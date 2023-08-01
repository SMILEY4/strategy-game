# initial configuration/setup of an existing docker swarm (i.e. things that can not be configured during ec2-creation)
# Usage: `python3 setup.py`

import json
import os

AWS_REGION = "eu-central-1"
AWS_DOCKER_SECRETS_PARAM_PATH = "/strategygame/docker/secrets"


def run_command(cmd):
    return os.popen(cmd).read()


def cmd_get_aws_parameters_by_path(path):
    return f"aws ssm get-parameters-by-path --region {AWS_REGION} --path \"{path}\" --with-decryption --no-paginate"


def cmd_set_docker_secret(name, value):
    return f"echo \"{value}\" | docker secret create {name} -"


def set_docker_secret(name, value):
    print(f"creating docker secret '{name}'")
    print(run_command(cmd_set_docker_secret(name, value)))


def get_properties():
    print(f"fetching parameters from {AWS_DOCKER_SECRETS_PARAM_PATH}...")
    parameters = json.loads(run_command(cmd_get_aws_parameters_by_path(AWS_DOCKER_SECRETS_PARAM_PATH)))
    for parameter in parameters["Parameters"]:
        fullname = parameter["Name"]
        name = fullname.split("/")[-1]
        value = parameter["Value"]
        set_docker_secret(name, value)


get_properties()

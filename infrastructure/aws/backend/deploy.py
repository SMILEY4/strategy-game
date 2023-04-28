# deployment of a docker-swarm stack provided by a .zip file in an s3-bucket. Resulting stack will be named "backend".
# Usage: `python3 deploy.py <tag>`
#   <tag> = part of the .zip-filename of the deployment-artifact in s3: `artifact_<tag>.zip`

import os
import sys

AWS_REGION = "eu-central-1"
DEPLOYMENT_ARTIFACT_BUCKET = "strategy-game.backend-deploy-artifacts"
DEPLOYMENT_ARTIFACT_PREFIX = "artifact_"
DEPLOYMENT_ARTIFACT_SUFFIX = ".zip"
WORKING_DIR = "/home/ubuntu/app"


def run_command(cmd):
    f = os.popen(cmd)
    message = f.read()
    code = f.close()
    return message, code


def cmd_download_s3(source, target):
    return f"aws s3 cp s3://{source} {target} --region {AWS_REGION}"


def cmd_unzip_artifact():
    return f"unzip -o {WORKING_DIR}/artifact.zip -d artifact"


def cmd_deploy_docker_stack():
    return f"docker stack deploy --compose-file {WORKING_DIR}/artifact/docker-compose.yml --with-registry-auth backend"


def s3_path(tag):
    return DEPLOYMENT_ARTIFACT_BUCKET + "/" + DEPLOYMENT_ARTIFACT_PREFIX + tag + DEPLOYMENT_ARTIFACT_SUFFIX


def deploy_stack():
    deployed = False
    remaining_retries = 10
    while (not deployed) and (remaining_retries > 0):
        remaining_retries = remaining_retries - 1
        msg, code = run_command(cmd_deploy_docker_stack())
        if code is None:
            deployed = True


def deploy(tag):
    print(f"Deploying deployment artifact with tag '{tag}'...")
    print(run_command(cmd_download_s3(s3_path(tag), WORKING_DIR + "/artifact.zip")))
    print(run_command(cmd_unzip_artifact()))
    deploy_stack()


if len(sys.argv) == 2:
    deploy(sys.argv[1])
else:
    print("Unexpected amount of arguments: " + str(sys.argv))

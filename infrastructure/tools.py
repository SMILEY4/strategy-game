import sys

from tool_utils import *

CLOUDFORMATION_STACK_NAME = "strategy-game"
CLOUDFORMATION_STACK_ENV_NAME = "-test"
CODEPIPELINE_GIT_BRANCH = "develop"
BUCKET_NAMES = [
    "strategy-game" + CLOUDFORMATION_STACK_ENV_NAME + ".webapp",
    "strategy-game" + CLOUDFORMATION_STACK_ENV_NAME + ".backend.artifacts",
    "strategy-game" + CLOUDFORMATION_STACK_ENV_NAME + ".frontend.artifacts",
    "strategy-game" + CLOUDFORMATION_STACK_ENV_NAME + ".build-log",
]
FILES_SECRETS = [
    [
        "strategy-game-backend/src/main/resources/application.prod.local.conf",
        "s3://strategy-game.config/backend/application.prod.local.conf"
    ],
    [
        "strategy-game-frontend/env/.env.production.local",
        "s3://strategy-game.config/frontend/.env.production.local"
    ],
    [
        "strategy-game-frontend/env/.env.local",
        "s3://strategy-game.config/frontend/.env.local"
    ]
]


def cmd_help():
    print("==============================================================================================================================")
    print("           'help':   prints information about all available commands")
    print("")
    print("     'build docu':   converts the markdown documentation files into html")
    print("")
    print("            'run':   runs frontend and backend (in dev mode)")
    print("    'run backend':   runs the backend (in dev mode)")
    print("   'run frontend':   runs the frontend (in dev mode)")
    print("")
    print("          'build':   builds the backend and frontend")
    print(" 'build frontend':   builds the frontend")
    print("  'build backend':   builds the backend")
    print("")
    print("   'create infra':   creates the required cloud infrastructure")
    print("   'delete infra':   deletes the whole cloud infrastructure")
    print("")
    print("         'deploy':   deploys the current state of the backend and frontend on the develop branch to the cloud")
    print(" 'deploy backend':   deploys the current state of the backend on the develop branch to the cloud")
    print("'deploy frontend':   deploys the current state of the frontend on the develop branch to the cloud")
    print("")
    print("   'push secrets':   pushes the local secrets to the cloud storage")
    print("                     (i.e. config files that are not checked into git and are required for production builds)")
    print("   'pull secrets':   pulls the secrets from the cloud storage and overwrites the local files")
    print("                     (i.e. config files that are not checked into git and are required for production builds)")
    print("==============================================================================================================================")


def cmd_docu_build_html():
    print("Build html-documentation...")
    with cd("documentation"):
        os.system("python tools.py")
    print("...done building html-documentation")


def cmd_run_backend():
    print("Starting backend...")
    with cd("strategy-game-backend"):
        os.system("gradlew run")


def cmd_run_frontend():
    print("Starting frontend...")
    with cd("strategy-game-frontend"):
        os.system("npm run dev")


def cmd_run():
    print("Starting system...")
    with cd("strategy-game-backend"):
        run_cmd_async(["gradlew", "run"])
    with cd("strategy-game-frontend"):
        run_cmd_async(["npm", "run", "dev"])


def cmd_build_backend():
    print("Building backend...")
    run_cmd("./strategy-game-backend/gradlew shadowJar")
    print("...backend built")


def cmd_build_frontend():
    print("Building frontend...")
    with cd("strategy-game-frontend"):
        run_cmd("npm run install")
        run_cmd("npm run build")
    print("...frontend built")


def cmd_build():
    cmd_build_backend()
    cmd_build_frontend()


def cmd_create_infra():
    print("Deploying infrastructure...")
    run_cmd([
        "aws", "cloudformation", "create-stack",
        "--stack-name", CLOUDFORMATION_STACK_NAME + CLOUDFORMATION_STACK_ENV_NAME,
        "--template-body", "file://./infrastructure/strategy-game-stack.yml",
        "--parameters",
        "ParameterKey='EnvName',ParameterValue='" + CLOUDFORMATION_STACK_ENV_NAME + "'",
        "ParameterKey='GitBranch',ParameterValue='" + CODEPIPELINE_GIT_BRANCH + "'",
        "--capabilities", "CAPABILITY_NAMED_IAM"
    ])
    print("...infrastructure deployed")


def cmd_delete_infra():
    print("Deleting infrastructure...")
    for bucket in BUCKET_NAMES:
        print("Emptying bucket: " + bucket)
        run_cmd(["aws", "s3", "rm", "s3://" + bucket, "--recursive"])
    run_cmd(["aws", "cloudformation", "delete-stack", "--stack-name", CLOUDFORMATION_STACK_NAME + CLOUDFORMATION_STACK_ENV_NAME])
    print("...infrastructure deleted")


def cmd_deploy_backend():
    print("Deploying backend...")
    run_cmd(["aws", "codepipeline", "start-pipeline-execution", "--name", "strategy-game" + CLOUDFORMATION_STACK_ENV_NAME + ".backend"])
    print("...done deploying backend")


def cmd_deploy_frontend():
    print("Deploying frontend...")
    run_cmd(["aws", "codepipeline", "start-pipeline-execution", "--name", "strategy-game" + CLOUDFORMATION_STACK_ENV_NAME + ".frontend"])
    print("...done deploying frontend")


def cmd_deploy():
    print("Deploying...")
    cmd_deploy_backend()
    cmd_deploy_frontend()
    print("...done deploying")


def cmd_push_secrets():
    print("Pushing secrets...")
    for secret in FILES_SECRETS:
        run_cmd(["aws", "s3", "cp", secret[0], secret[1]])
    print("...done pushing secrets")


def cmd_pull_secrets():
    print("Pulling secrets...")
    for secret in FILES_SECRETS:
        run_cmd(["aws", "s3", "cp", secret[1], secret[0]])
    print("...done pulling secrets")


def handle_input_command(commands):
    if len(sys.argv) == 2:
        cmd_help()
    else:
        cmd_args = " ".join(sys.argv[2:])
        if cmd_args in commands:
            commands[cmd_args]()
        else:
            print("Unknown command: " + sys.argv[2])


def main():
    handle_input_command({
        "help": cmd_help,
        "build docu": cmd_docu_build_html,
        "run backend": cmd_run_backend,
        "run frontend": cmd_run_frontend,
        "run": cmd_run,
        "build backend": cmd_build_backend,
        "build frontend": cmd_build_frontend,
        "build": cmd_build,
        "create infra": cmd_create_infra,
        "delete infra": cmd_delete_infra,
        "deploy backend": cmd_deploy_backend,
        "deploy frontend": cmd_deploy_frontend,
        "deploy": cmd_deploy,
        "push secrets": cmd_push_secrets,
        "pull secrets": cmd_pull_secrets,
    })


if __name__ == "__main__":
    main()

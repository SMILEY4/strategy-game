import os
import subprocess
import sys


def cmd_help():
    print("===========================================================================")
    print("        'help':   prints information about all available commands")
    print("  'build docu':   converts the markdown documentation files into html")
    print("         'run':   runs frontend and backend (in dev mode)")
    print(" 'run backend':   runs the backend (in dev mode)")
    print("'run frontend':   runs the frontend (in dev mode)")
    print("'deploy infra':   creates the required cloud infrastructure")
    print("  'deploy app':   builds and deploys the apps to the cloud")
    print("'delete infra':   creates the whole cloud infrastructure")  # TODO
    print("===========================================================================")


def cmd_docu_build_html():
    print("Build html-documentation...")
    with cd("documentation"):
        os.system("python build.py")
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
        subprocess.Popen("gradlew run", shell=True)
    with cd("strategy-game-frontend"):
        subprocess.Popen("npm run dev", shell=True)


def cmd_deploy_infra():
    stack_name = "strategy-game-stack"
    print("Deploying infrastructure...")
    cmd_delete_infra()
    os.system("aws cloudformation create-stack --stack-name " + stack_name + " --template-body file://./infrastructure/strategy-game-stack.yaml")


def cmd_delete_infra():
    stack_name = "strategy-game-stack"
    print("Deleting infrastructure...")
    os.system("aws cloudformation delete-stack --stack-name " + stack_name)


def cmd_deploy_apps():
    print("TODO")
    # get current state of stack
    #       aws cloudformation describe-stacks --stack-name strategy-game-stack
    # output: ... "StackStatus": "CREATE_COMPLETE" ...  => stack is ready
    # somehow find info to connect to instances/s3 -> "output"-section of "describe-stacks" ?


def run_command(commands):
    if len(sys.argv) == 2:
        cmd_help()
    else:
        cmd_args = " ".join(sys.argv[2:])
        if cmd_args in commands:
            commands[cmd_args]()
        else:
            print("Unknown command: " + sys.argv[2])


class cd:
    def __init__(self, new_path):
        self.newPath = os.path.expanduser(new_path)

    def __enter__(self):
        self.savedPath = os.getcwd()
        os.chdir(self.newPath)

    def __exit__(self, etype, value, traceback):
        os.chdir(self.savedPath)


def main():
    run_command({
        "help": cmd_help,
        "build docu": cmd_docu_build_html,
        "run": cmd_run,
        "run backend": cmd_run_backend,
        "run frontend": cmd_run_frontend,
        "deploy infra": cmd_deploy_infra,
        "delete infra": cmd_delete_infra,
    })


if __name__ == "__main__":
    main()

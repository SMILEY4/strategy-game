import sys
from tool_utils import *

PATH_EC2_KEY = "C:Users/LukasRuegner/Desktop/ec2-kp.pem"


def cmd_help():
    print("=================================================================================")
    print("           'help':   prints information about all available commands")
    print("     'build docu':   converts the markdown documentation files into html")
    print("            'run':   runs frontend and backend (in dev mode)")
    print("    'run backend':   runs the backend (in dev mode)")
    print("   'run frontend':   runs the frontend (in dev mode)")
    print("   'create infra':   creates the required cloud infrastructure")
    print("   'delete infra':   deletes the whole cloud infrastructure")
    print("'deploy frontend':   builds and deploys the frontend to the cloud")
    print(" 'deploy backend':   builds and deploys the backend to the cloud")
    print("        'backend':   builds and deploys the backend and frontend to the cloud")
    print(" 'build frontend':   builds the frontend")
    print("  'build backend':   builds the backend")
    print("        'backend':   builds the backend and frontend")
    print("=================================================================================")


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


def cmd_create_infra():
    stack_name = "strategy-game-stack"
    print("Deploying infrastructure...")
    run_cmd_async(["aws", "cloudformation", "create-stack", "--stack-name", stack_name,
             "--template-body", "file://./infrastructure/strategy-game-stack.yaml"])
    print("...infrastructure deployed")


def cmd_delete_infra():
    stack_name = "strategy-game-stack"
    print("Deleting infrastructure...")
    run_cmd_async(["aws", "cloudformation", "delete-stack", "--stack-name", stack_name])
    print("...infrastructure deleted")


def cmd_deploy_backend():
    print("Deploying backend...")
    stack_data = get_aws_stack_data("strategy-game-stack")
    if is_aws_stack_created(stack_data):
        cmd_build_backend()
        with ssh_ec2(get_aws_stack_ec2_dns_name(stack_data), "ubuntu", PATH_EC2_KEY) as client:
            print("connected to ec2 instance via ssh")
            print("...updating apt")
            client.send_command("sudo apt update -y", show_output=True)
            print("...installing jdk")
            client.send_command("sudo apt install openjdk-11-jre-headless -y", show_output=True)
            print("...uploading .jar")
            client.upload_file("./strategy-game-backend/build/libs/strategy-game-backend.jar", "/home/ubuntu")
        print("...done deploying backend")
    else:
        print("Error: Stack not created")


def cmd_deploy_frontend():
    print("Deploying frontend...")
    stack_data = get_aws_stack_data("strategy-game-stack")
    if is_aws_stack_created(stack_data):
        cmd_build_frontend()
        bucket_name = get_aws_stack_s3_bucket_name(stack_data)
        run_cmd(["aws", "s3", "sync", "./strategy-game-frontend/dist", "s3://"+bucket_name])
        print("...done deploying frontend")
    else:
        print("Error: Stack not created")


def cmd_deploy():
    cmd_deploy_backend()
    cmd_deploy_frontend()


def cmd_build_backend():
    print("Building backend...")
    run_cmd("./strategy-game-backend/gradlew shadowJar")
    print("...backend built")


def cmd_build_frontend():
    print("Building frontend...")
    with cd("strategy-game-frontend"):
        run_cmd("npm run build")
    print("...frontend built")


def cmd_build():
    cmd_build_backend()
    cmd_build_frontend()


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
        "run": cmd_run,
        "run backend": cmd_run_backend,
        "run frontend": cmd_run_frontend,
        "create infra": cmd_create_infra,
        "delete infra": cmd_delete_infra,
        "deploy backend": cmd_deploy_backend,
        "deploy frontend": cmd_deploy_frontend,
        "deploy": cmd_deploy,
        "build backend": cmd_build_backend,
        "build frontend": cmd_build_frontend,
        "build": cmd_build,
    })


if __name__ == "__main__":
    main()

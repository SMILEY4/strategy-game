import json
import os
import subprocess

import paramiko
from paramiko import SSHClient
from scp import SCPClient


# Get information about an aws cloudformation stack with the given name
def get_aws_stack_data(stack_name):
    return json.loads(run_cmd_returning(["aws", "cloudformation", "describe-stacks", "--stack-name", stack_name]))


# Get the current state of an aws cloudformation stack.
# "stack" can be the name of the stack or the (json-) data
def get_aws_stack_state(stack):
    data = get_aws_stack_data(stack) if isinstance(stack, str) else stack
    return "not found" if len(data["Stacks"]) == 0 else data["Stacks"][0]["StackStatus"]


# Check whether an aws cloudformation stack was successfully created and is ready
# "stack" can be the name of the stack or the (json-) data
def is_aws_stack_created(stack):
    data = get_aws_stack_data(stack) if isinstance(stack, str) else stack
    return get_aws_stack_state(data) == "CREATE_COMPLETE"


# Get the public dns name of the ec2 instance
# "stack" can be the name of the stack or the (json-) data
def get_aws_stack_ec2_dns_name(stack):
    return get_aws_stack_outputs_value(stack, "ServerPublicDnsName")


# Get the name of the s3 bucket
# "stack" can be the name of the stack or the (json-) data
def get_aws_stack_s3_bucket_name(stack):
    return get_aws_stack_outputs_value(stack, "WebAppBucketName")


# Get a value from the outputs of the given aws cloudformation stack by the key (or error if )
# "stack" can be the name of the stack or the (json-) data
def get_aws_stack_outputs_value(stack, key):
    data = get_aws_stack_data(stack) if isinstance(stack, str) else stack
    if is_aws_stack_created(data):
        outputs = data["Stacks"][0]["Outputs"]
        output_entry = search_json_array(outputs, lambda e: e["OutputKey"] == key)
        return output_entry["OutputValue"]
    else:
        return None


# run the given command provided as a string-array and return the output as a string
def run_cmd_returning(cmd):
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    (out, err) = proc.communicate()
    return out.decode("utf-8")


# run the given command provided as a string-array async
def run_cmd_async(cmd):
    subprocess.Popen(cmd, shell=True)


# run the given command provided as a string-array
def run_cmd(cmd):
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    (out, err) = proc.communicate()
    print(out.decode("utf-8"))


# change the directory for all commands in this "with"-block
class cd:

    def __init__(self, new_path):
        self.newPath = os.path.expanduser(new_path)

    def __enter__(self):
        self.savedPath = os.getcwd()
        os.chdir(self.newPath)

    def __exit__(self, etype, value, traceback):
        os.chdir(self.savedPath)


# open an ssh-connection
class ssh_ec2:

    def __init__(self, hostname, username, identity_file_path):
        self.hostname = hostname
        self.username = username
        self.identity_file_path = identity_file_path

    def __enter__(self):
        self.ssh_client = SSHClient()
        self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.ssh_client.connect(self.hostname, 22, username=self.username, key_filename=self.identity_file_path)
        return self

    def __exit__(self, etype, value, traceback):
        self.ssh_client.close()

    def send_command(self, cmd, show_output=False):
        stdin, stdout, stderr = self.ssh_client.exec_command(cmd)
        if show_output:
            print(f'STDOUT: {stdout.read().decode("utf8")}')
            print(f'STDERR: {stderr.read().decode("utf8")}')
        stdin.close()
        stdout.close()
        stderr.close()

    def upload_file(self, source, target):
        scp = SCPClient(self.ssh_client.get_transport())
        scp.put(source, target)


# return the first element of the given json array matching the given condition
def search_json_array(json_array, condition):
    for e in json_array:
        if condition(e):
            return e

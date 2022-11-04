import os
from os import system

S3_KEY = "s3://strategy-game.config/certificate/keystore.jks"


class cd:

    def __init__(self, _new_path):
        self.new_path = os.path.expanduser(_new_path)

    def __enter__(self):
        self.saved_path = os.getcwd()
        os.chdir(self.new_path)

    def __exit__(self, etype, value, traceback):
        os.chdir(self.saved_path)


def s3_download(s3_path, dest):
    system(f"aws s3 cp {s3_path} {dest}")


def s3_upload(src, s3_path):
    system(f"aws s3 cp {src} {s3_path}")


with cd("/home/ubuntu/server/infrastructure"):
    os.mkdir("sslCert")
    s3_download(S3_KEY, "sslCert/keystore.jks")

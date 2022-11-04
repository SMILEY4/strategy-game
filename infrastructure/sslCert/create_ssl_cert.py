# Requests a new ssl-certificate for the domain "api.strategy-game.lruegner.de" from "Let's Encrypt"
# and uploads it as an .jks to the s3-bucket "s3://strategy-game.config/certificate/keystore.jks"
#
# Run this script in the home directory (/home/ubuntu)
# Example: 'python create_ssl_cert.py mypassword'

import os
import sys
from os import system
import shutil

if len(sys.argv) < 2:
    print("Missing argument: no password provided")
    exit(0)

DOMAIN = "api.strategy-game.lruegner.de"
ALIAS = "strategy-game-ssl"
PASSWORD = sys.argv[1]
S3_KEY = "s3://strategy-game.config/certificate/keystore.jks"

TEST_RUN = "--test-cert"  # set to an empty string to perform the "real" request to "Let's Encrypt"


class cd:

    def __init__(self, _new_path):
        self.new_path = os.path.expanduser(_new_path)

    def __enter__(self):
        self.saved_path = os.getcwd()
        os.chdir(self.new_path)

    def __exit__(self, etype, value, traceback):
        os.chdir(self.saved_path)


def s3_download(s3_path, dest):
    print(f"Downloading file '{s3_path}' into '{dest}' ...")
    system(f"aws s3 cp {s3_path} {dest}")


def s3_upload(src, s3_path):
    print(f"Uploading file '{src}' into '{s3_path}' ...")
    system(f"aws s3 cp {src} {s3_path}")


def gen_certificate(domain, email):
    print(f"Generating certificate for domain '{domain}' ...")
    system(f"certbot certonly -d {domain} --dns-route53 --logs-dir ~/lencr/log/ --config-dir ~/lencr/config/ --work-dir ~/lencr/work/ -m {email} --agree-tos --non-interactive " + TEST_RUN)


def create_pkcs12(path_cert, path_key, path_out, alias, password):
    print(f"Creating pkcs12 ...")
    system(f"openssl pkcs12 -export -in {path_cert} -inkey {path_key} -out {path_out} -name {alias} -passin pass:{password} -passout pass:{password}")


def create_jks(path_pkcs, path_out, alias, password):
    print(f"Creating jks ...")
    system(f"keytool -importkeystore -deststorepass {password} -destkeypass {password} -destkeystore {path_out} -srckeystore {path_pkcs} -srcstoretype PKCS12 -srcstorepass {password} -alias {alias}")


os.mkdir("lencr")
with cd("lencr"):
    os.mkdir("log")
    os.mkdir("config")
    os.mkdir("work")
    os.mkdir("cert")
    gen_certificate(DOMAIN, "ruegnerlukas@gmail.com")
    shutil.copy(f"config/live/{DOMAIN}/fullchain.pem", "cert/fullchain.pem")
    shutil.copy(f"config/live/{DOMAIN}/privkey.pem", "cert/privkey.pem")
    create_pkcs12("cert/fullchain.pem", "cert/privkey.pem", "cert/pkcs.p12", ALIAS, PASSWORD)
    create_jks("cert/pkcs.p12", "cert/keystore.jks", ALIAS, PASSWORD)
    s3_upload("cert/keystore.jks", S3_KEY)
shutil.rmtree("lencr")

echo  !!! USING PLACEHOLDER PASSWORDS - DO NOT USE IN PRODUCTION !!!
export SECRET_ACCESS_KEY="password"
export ADMIN_PASSWORD="password"
docker compose -f docker-compose.yml up
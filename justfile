# Variables
export ADMIN_PASSWORD := "user12345"
export AWS_SECRET_ACCESS_KEY := "nothing"


# Detect Gradle wrapper
GRADLE := if os() == "windows" { "gradlew.bat" } else { "./gradlew" }


default:
	just --choose


# Run the infrastructure locally without server or webapp
[group("infra")]
infra-up:
	docker compose -f ./infrastructure/dockerstack/docker-compose-dev.yml up -d


# Stop the infrastructure locally without server or webapp
[group("infra")]
infra-down:
	docker compose -f ./infrastructure/dockerstack/docker-compose-dev.yml down


# Start the backend locally (in dev mode)
[group("server")]
[working-directory: 'backend']
server-run:
	{{GRADLE}} :strategy-game-app:run

# Run all backend tests and other checks
[group("server")]
[working-directory: 'backend']
server-test:
	{{GRADLE}} test detekt --continue


# Build the webapp wasm module
[group("webapp")]
[working-directory: 'frontend/js']
webapp-wasm:
	npm run wasm

# Start the webapp locally (in dev mode)
[group("webapp")]
[working-directory: 'frontend/js']
webapp-run:
	npm run dev

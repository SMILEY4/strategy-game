---
title: Backend Quickstart
---

# Building the Application

**Jar**

Creates a runnable .jar

```
./gradlew shadowJar
```

The created runnable jar can be found in `./build/libs/strategy-game-backend-x.y-all.jar`

**Docker**

Creates the full runnable docker image

```
docker build -t strategy-game:<VERSION> .
```

 



# Running the Application

## Intellij

To run the application in the Intellij-IDE, click the "Run Button" or the "Run Button" next to the "main"-function in "de.ruegnerlukas.strategygame.backend.Application.kt"

## CLI

   ```
./gradlew run
   ```

## Environment Variables

The following environment variables have to be provided:

- `AWS_SECRET_ACCESS_KEY` - the secret access key of the aws (IAM) user
- `ADMIN_PASSWORD` - the password to use for the admin user. Used to access some protected endpoints.

**Intellij**

- edit run configuration -> "Configuration" -> "Environment Variables" -> set variables here

**Intellij from .env-file**

- requires the Plugin "[EnvFile](https://plugins.jetbrains.com/plugin/7861-envfile)"
- edit run configuration -"Env File" -> check "Enable EnvFile" and add .env-file in the table below

## Dependencies

- a running arango-database accessible at the url and port specified in the configuration
  - can be run as docker via the docker-compose-file: `./infrastructure/local/docker-compose.yml`
- (optional) AWS-Cognito if specified in the configuration, a dummy (offline) identity-provider can be used instead.





# Configuration

All configuration (ktor and custom) is kept in [HOCON](https://github.com/lightbend/config/blob/main/HOCON.md)-Files in "src/main/resources/application.<...>.conf". More specific "".conf"-files overwrite values from lower files. Files ending with ".local.conf" are not checked into git

- *application.conf* - base configuration
- *application.local.conf* - base configuration for secrets (not checked into git)
- *application.[envname].conf* - configurationfor the current environment
- *application.[envname].local.conf* - configuration for the current environment for secrets (not checked into git)

The name of the current environment can be set in `CustomNettyEngineMain.main(myEnvironment, args)`.

Values from the configuration files can be accessed in a type-safe way via `Config.get().myValue`.





# Used Technologies

List of (some relevant) used technologies.

**Kotlin**

Programming language build on the JVM. [Link](https://kotlinlang.org/docs/home.html)

**Gradle**

Build automation tool. Manages dependencies and build-tasks. [Link](https://docs.gradle.org/current/userguide/userguide.html)

**Ktor**

Framework for building web applications. [Link](https://ktor.io/docs/welcome.html)

**Koin**

Lightweight kotlin dependency injection framework. [Link](https://insert-koin.io/)

**AWS-Cognito**

Simple and Secure User Sign-Up, Sign-In, and Access Control

- https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-dg.pdf
- https://medium.com/@warrenferns/integrate-java-with-aws-cognito-developer-tutorial-679e6e608951
- https://gist.github.com/saggie/38e5979cb813224666af4b3d90e6120f
- https://stackoverflow.com/questions/48356287/is-there-any-java-example-of-verification-of-jwt-for-aws-cognito-api

**ArangoDb**

A native multi-model database with flexible data models for  documents, graphs, and key-values. [Link](https://www.arangodb.com/docs/stable/)

**Arrow**

Arrow is a library for Typed Functional Programming in Kotlin. [Link](https://arrow-kt.io/docs/core/)

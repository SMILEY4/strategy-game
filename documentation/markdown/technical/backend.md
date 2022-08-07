---
title: Backend Documentation
---

# Running the Application

**Intellij**

To run the application in the Intellij-IDE, click the "Run Button" or the "Run Button" next to the "main"-function in "de.ruegnerlukas.strategygame.backend.Application.kt"

**CLI**

   ```
./gradlew run
   ```

**CLI with auto-reloading**

Auto-reload detects changes in output files and reloads them at runtime. 

1. First execute the following command. After finishing, it waits for changes and compiles the new files. 

   ```
   ./gradlew -t build -x test -x shadowJar -i
   ```

2. Open another terminal tab and run the following command. It starts the server and waits for changes.

   ```
   ./gradlew run -Dev=true
   ```

   The "-Dev=true"-flag start the server in Development-Mode and enables auto-reload

3. The application is now available on `http://localhost:8080` 



# Building the Application

Creates a runnable .jar

```
./gradlew shadowJar
```

The created jar can be found in `./build/libs/strategy-game-backend-x.y-all.jar`



# Used Technologies

**Kotlin**

Programming language build on the JVM. [Link to documentation](https://kotlinlang.org/docs/home.html)

**Gradle**

Build automation tool. Manages dependencies and build-tasks. [Link to documentation](https://docs.gradle.org/current/userguide/userguide.html)

**Ktor**

Framework for building web applications. [Link to documentation](https://ktor.io/docs/welcome.html)

**AWS-Cognito**

Simple and Secure User Sign-Up, Sign-In, and Access Control

- https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-dg.pdf
- https://medium.com/@warrenferns/integrate-java-with-aws-cognito-developer-tutorial-679e6e608951
- https://gist.github.com/saggie/38e5979cb813224666af4b3d90e6120f
- https://stackoverflow.com/questions/48356287/is-there-any-java-example-of-verification-of-jwt-for-aws-cognito-api

**ArangoDb**

A native multi-model database with flexible data models for  documents, graphs, and key-values. [Link to Documentation](https://www.arangodb.com/docs/stable/)

**Arrow**

Arrow is a library for Typed Functional Programming in Kotlin. [Link to Documentation](https://arrow-kt.io/docs/core/)



# Architecture

The backend-architecture is based on the "[Hexagonal Architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))".

## File/Directory Structure

- *Application.kt* - the entry-point of the application. Contains no code besides starting the app.
- */config* - Configures the whole application. Only package that depends on all other packages.
- */ports* - defines the interface with all service-interfaces and models between the core business logic and external service providers (e.g. databases, clients, controllers, ...)
  - */models* - contains all models
  - */provided* - interfaces for all services provided and implemented by the core and used by external services
  - */required* - interfaces required by the core and implemented by external services
- */core* - the core business logic
- */external* - external services, e.g. databases, clients, controllers, ...
- */shared* - code used by all/most other packages, contains utility functions and common logic

## Error Handling

- e.g.: when calling a function, three different things can happen -> need to be handled differently
  - **success** / everything is fine
    - continue as normal
  - expected **error** (e.g. cant find user by name)
    - all errors MUST be handled
    - handle via "[Either](https://arrow-kt.io/docs/apidocs/arrow-core/arrow.core/-either/)" + strictly defined error-objects
    - every interface (in "ports") returns its own strictly defined errors 
  - unexpected **exception** (e.g. no connection to db)
    - throw exception 
    - exceptions normally caught by rest-controller





# Configuration

All configuration is kept in [HOCON](https://github.com/lightbend/config/blob/main/HOCON.md)-Files in "src/main/resources/application.<...>.conf". More specific "".conf"-files overwrite values from lower files. Files ending with ".local.conf" are not checked into git

- *application.conf* - base configuration
- *application.local.conf* - base configuration for secrets (not checked into git)
- *application.[envname].conf* - configurationfor the current environment
- *application.[envname].local.conf* - configuration for the current environment for secrets (not checked into git)

The name of the current environment can be set in `CustomNettyEngineMain.main(environment, args)`.

Values from the configuration files can be accessed in a typesafe way via `Config.get().myValue`.



# API

## Authentication

The backend uses JSON-Web Tokens (RS256) managed by "AWS Cognito" as authentication

### Creating a new User

1. The client sends the users email (must be unique), password and username to the server
2. A verification email is sent to the provided email-address with a confirmation code
3. The client sends the users email and confirmation-code to the server
4. The user is now created and verified and can now be authenticated

### Sign-In as a valid User

1. send email and password to the server

2. the response contains the jwt-token (idToken)

3. to access restricted routes, send the token in the "Authorization"-header

   ```
   Bearer <idToken>
   ```
   
   For protected WebSocket-Connections, the jwt-token (idToken) is send as a query parameter
   
   ```
   ...?token=<idToken>
   ```



## Endpoints

[Endpoint Documentation](./api.md)


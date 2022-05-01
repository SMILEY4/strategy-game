---
title: Backend Documentation
---





# Running the Application

**Intellij**

To run the application in the Intellij-IDE, click the "Run Button" or the "Run Button" next to the "main"-Funktion in "de.ruegnerlukas.strategygame.backend.Application.kt"

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

### Creating a new User

1. The client sends the users email (must be unique), password and username to the server
2. A verification email is sent to the provided email-address with a confirmation code
3. The client sends the users email and confirmation-code to the server
4. The user is now created and verified and can now be authenticated

### Sign-In as a valid User

1. send email and password to the server

2. the response contains the jwt-token (idToken)

3. to access restricted routes, send the token in the "Authentication"-header

   ```
   Bearer <idToken>
   ```



## Endpoints

### User

**Sign-Up**

Creates a new user. The email must be unique.

```
POST /api/user/signup
```

- Request

  ```json
  {
  	"email": "example@email.com",
  	"password": "password123",
      "username": "example"
  }
  ```

- Responses

  - 200 OK

  - 400 Bad Request

    ```
    INVALID_EMAIL_OR_PASSWORD
    ```

    The email or password is invalid, e.g. too short

  - 400 Bad Request

    ```
    CODE_DELIVERY_FAILURE
    ```

    The confirmation code could not be sent to the given email

  - 409 Conflict

    ```
    USER_EXISTS
    ```

    A user with the given email already exists

**Confirm Email**

Confirm the user by sending the code sent to the given email-address

```
POST /api/user/confirm
```

- Request

  ```json
  {
      "email": "example@email.com",
      "code": "123456"
  }
  ```

- Responses

  - 200 OK

  - 400 Bad Request

    ```
    TOO_MANY_FAILED_ATTEMPTS
    ```

    The user send too many "confirm"-requests with an incorrect code

  - 400 Bad Request

    ```
    EXPIRED_CODE
    ```

    The provided code  has expired

  - 404 Not Found

    ```
    USER_NOT_FOUND
    ```

    The user with the given email does not exist

  - 409 Conflict

    ```
    CODE_MISMATCH
    ```

    The code is not correct

**Login**

Login with username and password to receive a JWT (JSON Web Token) for further authentications

```
POST /api/user/login
```

- Request

  ```json
  {
  	"email": "example@email.com",
  	"password": "password123",
  }
  ```

- Responses

  - 200 OK

    ```json
    {
    	"idToken": "the (jwt) token used for authentication (short lifetime)",
        "refreshToken": "the token used to get a new idToken without manual login"
    }
    ```

  - 401 Unauthorized

    ```
    NOT_AUTHORIZED
    ```

    The given email and password do not match any existing user 

  - 404 Not Found

    ```
    USER_NOT_FOUND
    ```

    The user with the given email does not exist

  - 409 Conflict

    ```
    USER_NOT_CONFIRMED
    ```

    The user has not yet confirmed the email

**Refresh**

Get a new (jwt) idToken without sending email and password again.

```
POST /api/user/refresh
```

- Request

  ```
  "the refresh-token as plain-text"
  ```

- Responses

  - 200 OK

    ```json
    {
    	"idToken": "the (jwt) token used for authentication (short lifetime)",
        "refreshToken": null
    }
    ```

  - 401 Unauthorized

    ```
    NOT_AUTHORIZED
    ```

    The given refresh token is invalid

  - 404 Not Found

    ```
    USER_NOT_FOUND
    ```

    The user does not exist

  - 409 Conflict

    ```
    USER_NOT_CONFIRMED
    ```

    The user has not yet confirmed the email

**Delete (protected)**

Delete the given user. The email and password must be send again, even though the user is already "logged in".

```
DELETE /api/user/delete
```

- Request

  ```json
  {
  	"email": "example@email.com",
  	"password": "password123",
  }
  ```

- Responses

  - 200 OK
  - 401 Unauthorized (token, email or password incorrect)

### World

**Create World**

```
POST /api/world/create
```

- Request

  *empty*

- Responses

  - 200 OK

    ```json
    {
    	"worldId": "String"
    }
    ```

  - 500 Internal Server Error

    ```
    // the error message
    ```

**World WebSocket-Connection**

```
WS /api/world/messages
```



## WebSocket-Messages

All messages follow the following format

```json
{
    "type": "String - the identifying type of this websocket-message",
    "payload": "String - the payload of the message as a json-string"
}
```

- "[IN]" = messages sent by the client(s) and handled by the server/backend
- "[OUT]" = messages sent by the server/backend and handled by the client(s)

**[IN] Join World**

- Type: `join-world`

- Payload

  ```json
  {
      "worldId": "String - the id of the world to join",
      "playerName": "String - the name of the joining player"
  }
  ```

**[IN] Submit Turn**

- Type: `submit-turn`

- Payload

  ```json
  {
      "worldId": "String - the id of the world to submit the turns for",
      "commands": [
          {
              "q": "Int - the q-coordinate of the marker",
              "r": "Int - the r-coordinate of the marker"
          }
      ]
  }
  ```

**[OUT] Initial World State**

- Type: `world-state`

- Payload

  ```json
  {
      "map": {
          "tiles": [
              "q": "Int - the q-coordinate of the tile",
              "r": "Int - the r-coordinate of the tile",
              "tileId": "Int - the id specifying the type of the tile"
          ]
      }
  }
  ```

**[OUT] New Turn**

- Type: `new-turn`

- Payload

  ```json
  {
      "addedMarkers": [
          {
              "q": "Int - the q-coordinate of the added marker",
              "r": "Int - the r-coordinate of the added marker",
              "playerId": "Int - the current id of the player owning the marker"
          }
      ]
  }
  ```


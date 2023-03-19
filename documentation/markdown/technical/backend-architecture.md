---
title: Backend Architecture
---

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

[Endpoint/API Documentation](./api.md)


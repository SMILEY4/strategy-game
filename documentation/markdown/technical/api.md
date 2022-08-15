---
title: API
---

# Http-Endpoints

## User

### Sign-Up

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

### Login

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

### Refresh

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

### Delete (protected)

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

## Game

### Create new Game (protected)

Create a new game. Other players can join this game via the returned game-id

```
POST /api/game/create
```

- Responses

  - 200 OK

    ```
    <the-game-id>
    ```

  - 401 Unauthorized

### Join Game (protected)

Join a game created by another player as a participant.

```
POST /api/game/join/:gameId
```

- Responses
  - 200 OK
  - 401 Unauthorized
  - 404 Not Found

### List Games (protected)

List all games with the requester as a participant.

```
GET /api/game/list
```

- Responses

  - 200 OK

    ```
    [
    	GAME_ID_1,
    	GAME_ID_2,
    	...
    ]
    ```

  - 401 Unauthorized

## Game Websocket

### Connect to a Game

Open a websocket-connection to a game you already joined/created

```
WS /api/game/:gameId?token=<jwt>
```

- Responses

  - Accepts request and "opens" connection

  - 401 Unauthorized

  - 404 Not Found

  - 409 Conflict
  
    ```
    NOT_PARTICIPANT
    ```



# WebSocket-Messages

All messages follow the following format

```json
{
    "type": "String - the identifying type of this websocket-message",
    "payload": "object - the payload of the message"
}
```

- "[IN]" = messages sent by the client(s) and handled by the server/backend
- "[OUT]" = messages sent by the server/backend and handled by the client(s)

## [IN] Submit Turn

- Type: `submit-turn`

- Payload

  ```json
  {
      "commands": [
          {
              "type": "place-marker",
              "q": "Int - the q-coordinate of the new marker",
              "r": "Int - the r-coordinate of the new marker",
          },
          {
              "type": "create-city",
              "q": "Int - the q-coordinate of the new city",
              "r": "Int - the r-coordinate of the new city",
              "name": "String - the name of the new city"
          }
      ]
  }
  ```

## [OUT] World State

- Type: `world-state`

- Payload

  ```json
  {
      "game": {
          "turn": "Int - the current turn",
          "countries": [
              {
                  "countryId": "String - the id of the country",
                  "userId": "String - the id of the owner",
                  "resources": {
                      "money": "Float - the amount of available money"
                  }
              }
          ],
          "tiles": [
              {
                  "tileId": "String - the id of the tile",
                  "position": {
                      "q": "Int - the q-coordinate",
                      "r": "Int - the r-coordinate",
                  },
                  "data": {
                      "terrainType": "String - the type of the terrain",
                  },
                  "influences": [
                      {
                          "countryId": "String - the id of the country",
                          "value": "Double - the total amount of influence of the  country on the tile"
                      }
                  ],
                  "ownerCountryId": "String or null - the id of the country owning this tile",
                  "content": [
                      {
                          "type": "marker",
                          "countryId": "String - the id of the owner country"
                      }
                  ]
              }
          ],
          "cities": [
              {
                  "cityId": "String - the id of the city",
                  "countryId": "String - the id of the owner-country",
                  "tile": {
                  	"tileId": "String - the id of the tile",
                      "q": "Int - the q-coordinate of the tile",
                      "r": "Int - the r-coordinate of the tile",
                  },
                  "name": "String - the name of the city"
              }
          ]
      }
  }
  ```

## [OUT] Turn Result

- Type: `turn-result`

- Payload

  ```json
  {
      "game": {
          "turn": "Int - the current turn",
          "countries": [
              {
                  "countryId": "String - the id of the country",
                  "userId": "String - the id of the owner",
                  "resources": {
                      "money": "Float - the amount of available money"
                  }
              }
          ],
          "tiles": [
              {
                  "tileId": "String - the id of the tile",
                  "position": {
                      "q": "Int - the q-coordinate",
                      "r": "Int - the r-coordinate",
                  },
                  "data": {
                      "terrainType": "String - the type of the terrain",
                  },
                  "influences": [
                      {
                          "countryId": "String - the id of the country",
                          "value": "Double - the total amount of influence of the  country on the tile"
                      }
                  ],
                  "ownerCountryId": "String or null - the id of the country owning this tile",
                  "content": [
                      {
                          "type": "marker",
                          "countryId": "String - the id of the owner country"
                      }
                  ]
              }
          ],
          "cities": [
              {
                  "cityId": "String - the id of the city",
                  "countryId": "String - the id of the owner-country",
                  "tile": {
                  	"tileId": "String - the id of the tile",
                      "q": "Int - the q-coordinate of the tile",
                      "r": "Int - the r-coordinate of the tile",
                  },
                  "name": "String - the name of the city"
              }
          ]
      },
      "errors": [
         {
              "errorMessage": "String"
         }
      ]
  }
  ```

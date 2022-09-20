---
title: API
---

# Http-Endpoints

A Swagger-UI with all endpoints is available at `/swagger-ui`

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
              "name": "String - the name of the new city",
          }
      ]
  }
  ```

## [OUT] Game State

- Type: `game-state`

- Payload

  ```json
  {
      "turn": "Int - the current turn",
      "tiles": [
          {
              "baseData": {
                  "tileId": "String - the id of the tile",
                  "position": {
                      "q": "Int - the q-coordinate of the tile",
                      "r": "Int - the r-coordinate of the tile",
                  },
                  "visibility": "String - UNKNOWN | DISCOVERED | VISIBLE"
              },
              "generalData?": {
                  "terrainType": "String - the type of the terrain",
                  "owner?": {
                      "countryId": "String - the id of the country owning this tile",
  
                      "cityId": "String - the id of the city this tile belongs to",
                  }
              },
              "advancedData?": {
              	"influences": [
                      {
                          "countryId": "String - the id of the country or '?'",
                          "value": "Double - the total amount of influence of the  country on the tile",
                          "sources": [
                              {
                                  "cityId": "String - the id of the city",
  
                                  "value": "Double - the amount of influence of the  city on the tile",
                              }
                          ]
                      }
                  ],
                  "content": [
                      {
                          "type": "marker",
                          "countryId": "String - the id of the owner country"
                      }
                  ]
              }
          }
      ],
      "countries": [
          {
              "baseData": {
                  "countryId": "String - the id of the country",
                  "userId": "String - the id of the owner",
                  "color": {
                      "red": "Int [0,255]",
                      "green": "Int [0,255]",
                      "blue": "Int [0,255]",
                  }
              },
              "advancedData?": {
                  "resources": {
                      "money": "Float - the amount of available money"
                  }
              }
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
          	"name": "String - the name of the city",
              "color": {
                  "red": "Int [0,255]",
                  "green": "Int [0,255]",
                  "blue": "Int [0,255]",
              }
          }
      ]
  }
  ```
  
  

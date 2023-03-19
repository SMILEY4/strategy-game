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
              "provinceId": "String or null - the province this city will belong to (null to create new province)"
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
                          "value": "Double - the total amount of influence of the  country on the tile",
                          "sources": [
                              {
                                  "cityId": "String - the id of the city",
                                  "provinceId": "String - the id of the province",
                                  "value": "Double - the amount of influence of the  city on the tile",
                              }
                          ]
                      }
                  ],
                  "owner": {
                      "countryId": "String or null - the id of the country owning this tile",
                      "provinceId": "String - the id of province this tile belongs to",
                      "cityId": "String - the id of city this tile belongs to",
                  },
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
                  "provinceId": "String - the id of the province this city belongs to",
                  "tile": {
                  	"tileId": "String - the id of the tile",
                      "q": "Int - the q-coordinate of the tile",
                      "r": "Int - the r-coordinate of the tile",
                  },
                  "name": "String - the name of the city"
              }
          ],
          "provinces": [
              {
                  "provinceId": "String - the id of the province",
                  "countryId": "String - the id of the owner country"
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
                          "value": "Double - the total amount of influence of the  country on the tile",
                          "sources": [
                              {
                                  "cityId": "String - the id of the city",
                                  "provinceId": "String - the id of the province",
                                  "value": "Double - the amount of influence of the  city on the tile",
                              }
                          ]
                      }
                  ],
                  "owner": {
                      "countryId": "String or null - the id of the country owning this tile",
                      "provinceId": "String - the id of province this tile belongs to",
                      "cityId": "String - the id of city this tile belongs to",
                  },
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
                  "provinceId": "String - the id of the province this city belongs to",
                  "tile": {
                  	"tileId": "String - the id of the tile",
                      "q": "Int - the q-coordinate of the tile",
                      "r": "Int - the r-coordinate of the tile",
                  },
                  "name": "String - the name of the city"
              }
          ],
          "provinces": [
              {
                  "provinceId": "String - the id of the province",
                  "countryId": "String - the id of the owner country"
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

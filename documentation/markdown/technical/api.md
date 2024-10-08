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
              "withNewProvince": "Bool - whether to add it to an existing province or create a new one with the city as its capital"
          },
          {
              "type": "place-scout",
              "q": "Int - the q-coordinate of the scout",
              "r": "Int - the r-coordinate of the scout",
          },
          {
              "type": "production-queue-add-entry.building",
              "cityId": "String - the id of the city to construct the building in",
              "buildingType": "FARM | FISHERS_HUT | MINE | ..."
          },
          {
              "type": "production-queue-add-entry.settler",
              "cityId": "String - the id of the city to construct the settler in",
          },
          {
              "type": "production-queue-remove-entry",
              "cityId": "String - the id of the city to construct the settler in",
              "queueEntryId": "String - the id of the entry in the queue to remove"
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
              "dataTier0": {
                  "tileId": "String - the id of the tile",
                  "position": {
                      "q": "Int - the q-coordinate of the tile",
                      "r": "Int - the r-coordinate of the tile",
                  },
                  "visibility": "String - UNKNOWN | DISCOVERED | VISIBLE"
              },
              "dataTier1?": {
                  "terrainType": "String - the type of the terrain",
                  "owner?": {
                      "countryId": "String - the id of the country owning this tile",
                      "provinceId": "String - the id of the province owning this tile "
  
                      "cityId": "String|null - the id of the city this tile belongs to",
                  }
              },
              "dataTier2?": {
              	"influences": [
                      {
                          "countryId": "String - the id of the country or '?'",
                          "provinceId": "String - the id of the province or '?'",
                          "cityId": "String - the id of the city or  '?'",
                          "amount": "Double - the total amount of influence of the  country on the tile",
                      }
                  ],
                  "objects": [
                      {
                          "type": "marker",
                          "countryId": "String - the id of the owner country"
                      },
                      {
                          "type": "scout",
                          "countryId": "String - the id of the owner country",
                          "creationTurn": "Int - the turn in which the scout was placed"
                      },
                      {
                          "type": "city",
                          "countryId": "String - the id of the owner country",
                          "cityId": "String - the id of the city"
                      },
                  ]
              }
          }
      ],
      "countries": [
          {
              "dataTier1": {
                  "id": "String - the id of the country",
                  "name": "String - the name of the country",
                  "userId": "String - the id of the owner player",
                  "userName": "String - the name of the owner player",
                  "color": {
                      "red": "Int [0,255]",
                      "green": "Int [0,255]",
                      "blue": "Int [0,255]",
                  }
              },
              "dataTier3?": {
                  "availableSettlers": "Int - the amount of available settlers"
              }
          }
      ],
      "cities": [
      	{
          	"cityId": "String - the id of the city",
          	"countryId": "String - the id of the owner-country",
          	"isProvinceCapital": "Boolean - whether this city is the capital of the province",
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
              },
              "buildings": [
                  {
                      "type": "String - the type of the building",
                      "tile": {
                          "tileId": "String - the id of the worked tile",
                          "q": "Int - the q-coordinate of the worked tile",
                          "r": "Int - the r-coordinate of the worked tile",
                      }
                  }
              ],
              "productionQueue": [
                   {
                       "type": "building",
                       "entryId": "String - the id of the entry",
                       "progress": "Float[0,1] - the current construction progress",
                       "buildingType": "FARM | FISHERS_HUT | MINE | ..."
                   },
                  {
                       "type": "settler",
                       "entryId": "String - the id of the entry",
                       "progress": "Float[0,1] - the current construction progress"
                   }
              ]
          }
      ],
      "provinces": [
          {
              "dataTier1": {
                  "id": "String - the id of the province",
                  "name": "String - the name of the province",
                  "countryId": "String - the id of the owner country",
                  "color": {
                      "red": "Int [0,255]",
                      "green": "Int [0,255]",
                      "blue": "Int [0,255]",
                  },
                  "cityIds": [
                      "String - the ids of cities in this province (incl. capital)"
                  ],
                  "provinceCapitalCityId": "String - the id of the province capital city"
              },
              "dataTier3?": {
                  "resourceBalance": {
                      "<ResourceType>": "Float - balance of the given type"
                  }
              }
          }
      ],
      "routes": [
          {
              "routeId": "String - the id of the route",
              "cityIdA": "String - the id of one of the connected cities",
              "cityIdB": "String - the id of the other connected city",
              "path": [
                  {
                      "tileId": "String - the id of the tile",
                      "q": "Int - the q-coordinate of the tile",
                      "r": "Int - the r-coordinate of the tile",
                  }
              ]
          }
      ]
  }
  ```
  
  

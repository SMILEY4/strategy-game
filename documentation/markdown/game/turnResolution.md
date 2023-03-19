---
title: Turn Resolution
---

# Turn Resolution

- after all players have submitted their turn



## 1. Resolve Commands

- for each command given this turn: resolve command and update game state

#### Place Marker

- **Validate**
  - target tile must not already contain a marker (of any country)
- **Update**
  - add a new marker for the country to target tile

#### Place Scout

- **Validate**
  - target tile must be discovered by country
  - target tile must not already contain a scout of the country
  - country has not already reached the max. scout count
- **Update**
  - add a new scout for the country to target tile

#### Create Town

- **Validate**
  - name of town must be valid
  - target tile must be valid terrain
  - target tile must not already contain another town/city
  - country must have enough resources to create town
  - target tile must be owned by country 
- **Update**
  - add a new town of the country to target tile
  - remove resource-cost of town from the country

#### Create City

- **Validate**
  - name of city must be valid
  - target tile must be valid terrain
  - target tile must not already contain another town/city
  - country must have enough resources to create city
  - target tile must not be owned by another country
  - country must have enough influence in target tile (one of):
    - country owns target tile
    - no country has more than a certain amount of influence in the target tile
    - the country has the most influence in the target tile 

- **Update**
  - add a new city of the country to target tile
  - remove resource-cost of city from the country



## 2. Update Game World/State

- update country resources, i.e. income each turn
- re-calculate country influence for each tile
- calculate tile-owner for each tile not owned by any country
  - country has enough influence in tile
  - tile close to city/town
- update discovered tiles - for each tile, mark discovered by country if:
  - already discovered
  - country has influence in tile
  - is close to scout
- update tile content (for each tile,content):
  - scout: remove, if past max. "lifetime"



## 3. Prepare Game State and start next Turn

- increment turn counter
- set state of each player to "playing"
- send new current state to each player


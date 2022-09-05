# Milestone 0.3

**Main Gameplay Goal: "Resource Gathering"**

1. fog of war system
   - calculate visibility in backend
     - tile is "visible" if
       - country has some influence in tile
       - tile is not owned by another country
     - tile is "uncovered" if
       - country had seen tile in the past 
   - only send visible data to each player
   - render/display visibility states appropriately
2. scouting system
   - player can send scout to selected tile
   - uncovers surrounding area for x turns

3. enhance tile ownership

   - cleanup system -> when to update what ? (influence each turn, country ownership on city creation for affected tiles, ...)

   - each tile belongs to one or zero countries
     - country has the most influence in the tile
     - country has more than x influence in the tile
   - each tile of a country belongs to exactly one province
     - the province of the city that claimed the tile
   - each tile of a country belongs to exactly one city
     - the city with the most influence in a tile
     - each city has a guaranteed ownership radius
       - all tiles in that area belong to that city, no matter the influence
       - => small settlement next to big city -> small settlement would otherwise own no tile at all 

4. generate randomly distributed basic resources

   - forests (wood)

   - mountains (stone)

   - iron (in some mountain tiles)

   - fish (food)

   - adapt city creation validation -> "is valid tile (type)"

5. implement other resource types for country

   - money (exists already)
   - wood
   - stone
   - food
   - iron

6. buildings can be added to cities

   - have no effect yet (next steps)

   - cost x amount of resources

   - building types

     - "Lumber Camp", tile = forest, resource = wood

     - "Iron Mine", tile = iron, resource = iron

     - "Stone Mine", tile = mountain, resource = stone

     - "Fishers Hut", tile = fish, resource = food

7. buildings produce correct amount of resources each turn based on building stats + available tiles

   - "max amount workable tiles" = the amount of tiles that can be worked by one building of this type
   - "resources per tile"  = the amount and types of resources gathered from one tile of one building of this type
   - a tile can only be worked by max. one building
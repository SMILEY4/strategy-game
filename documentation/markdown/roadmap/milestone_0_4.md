# Milestone 0.4

**Main Gameplay Goal: "Basic Economy (Production-Chain + Trading)"**

1. economic areas share resources/production/consumption
   - resource not managed by whole country, but localized on area-level (area = main city + child-towns)
   - no stockpiles -> only production/income per turn matters
2. add basic production chains
   - remove cost for constructing buildings, founding cities, city upkeep, ... (for now)
   - implement local economy/production/production-chain (on area-level)
     - buildings gather raw resources from tiles
     - buildings take resource/goods and produce other goods

3. construct city/road network (global network of connected cities/areas)

   - later used for trade routes/network

   - constraints
     - path must exist (pathfind a*)

     - path must be either completely land or completely sea

     - path may not be longer than x tiles

     - path may not cross another cities area, i.e. path from city A to B can only cross tiles of A, tiles of B or unclaimed tiles

4. trade routes

   - cities have n trade routes based on trade-buildings
   - cities decide route-destinations automatically (update every x turns)
   - trade routes transfer resources each turn
5. display exact paths, trade-routes in ui as lines


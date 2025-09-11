# Milestone 0.5

*Main Gameplay Goal: "Life-cycle of a city"*

1. City Creation

   - "build" settlers in cities (same process as buildings, i.e. construction queue, required resources)
     - require food and wood to produce (-> food=people, wood=early houses)
     - should be cheap enough to be able to build required small towns
   - settler as a "resource" of that country
   - can create new cities as long as settlers are available

2. city size, growth and decline

     - size of city in levels ("civilization"-style)
     - growth/decline based on meter and points
       - reaches +x points -> +1 Pop level
         - reaches -y Points -> -1 Pop level
         - required points can be dependent on current level
         - points:
           - +1 enough food available
           - -1 not enough food available
           - +1 construction material available (wood, stone)
           - ...

3. village/town/city upgrades
     - settlers create villages
     - settlements can be upgraded: village -> town -> city
     - upgrades have requirements
       - population size
       - one city per province
       - ...
     - "status" defines some attributes of settlements
       - amount of building slots
       - available buildings
       - limit to population level for villages and towns
       - ...
     - towns,cities can be promoted to province capital -> creates new province
4. production queue for buildings
   - constructing buildings adds them to construction queue of city
   - only one building can be constructed at once
   - construction of a building requires x total resources
   - resources are consumed each turn until all required resources are collected
   - *Note: make queue as generic as possible to allow for any kind of task to be placed in production queue*
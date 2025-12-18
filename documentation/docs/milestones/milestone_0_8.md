*Main Gameplay Goal: "Complete Life-cycle of a settlement as first complete gameplay loop"*



**Tiles**

- tile can have multiple resources
- resources can deplete and/or refresh
- improved resource generation

**Workers**

- units
- replace settlers
- produced in settlements
- get two starting workers
- can build improvements on tiles


**Improvements**

- can produce (raw) resources
- can consume resources (usually food to feed specialized workforce)
- can be upgrade to be "bigger" -> produce more, consume more
- can have requirements (terrain type, available tile resources, ...)
- one improvement per tile
- types
    - mine (produces iron)
    - quarry (produces stone)
    - woodworkers camp (produces wood)
    - farmstead (produces food)
    - fishing camp (produces food)
    - fortification (expands influence)
    - frontier settlement (no real improvement, directly spawns settlement)


**Settlements**

- foundation: expand improvement into settlement
- can have
    - buildings: normal buildings inside settlement, takes building slots
- population
    - grows/shrinks based on different factors
        - different factors give a +x or -x to growth progress
        - if progress hits +100, a new pop is added and the progress is reset to 0
        - if progress hits -100, a new pop is removed and the progress is reset to 0
        - factors
        	 - available food > required food (has food surplus): +1
        	 - available food < required food (has food deficit): -1
        	 - pop size >> work slots (unemployment, emigration): -1
        	 - pop size < work slots (migration): +1
    - does subsistence farming, output depends on pop size
    - available population is automatically assigned to work slots
        - buildings require pop
        - remaining is assigned to subsistence farming
        - if food deficit -> specialist are moved to subsistence farming before starving
- tile improvement bonus
    - settlements provide bonuses to nearby tile improvements
    - bonus based on settlement size, type, buildings, ...


**Trading**

- resources are produces at a specific location but can be consumed somewhere else
- producers and consumers are connected via a network of routes
- routes automatically form between nearby settlements and improvements 


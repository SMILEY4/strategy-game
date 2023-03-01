---
title: Resource Handling
---

# Resource Handling

## Definitions

- **produced** - resources obtained from building, tech income, abilities, trade, ... (does not include ANY consumption)

- **produced resources last turn** - all resources that where produced in the last turn
- **produced resources this turn** - all resources that where produced in this turn (will become "produced resources last turn")
- **consumed resources** - all resources that have been consumed this turn 
- **available resources** - resources that are still available for this turn, i.e. "produced resources last turn" - "consumed resources"
- **resource deficit** - resources that where required this turn, but not available

## Process

**Previous Turn**

- remember "produced resources" from this turn per province (="produced last turn" from pov of "current turn")

**Current Turn**

- for each "thing" (building, population, ...) in each province that requires/provides resources:
  - if enough resources produced and left from last turn (i.e. "produced last turn" - "already consumed this turn")
    - add input resources to "consumed", add output resource to "produced this turn"
  - if not enough resources
    - add input resources to "deficit"
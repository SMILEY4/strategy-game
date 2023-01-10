---
title: Resource Handling
---

# Resource Handling

## Status-Quo

- for each province
  - get the (leftover) resources from the last turn for this province
  - for each city
    - handle production - for each building:
      - if required resources for production are available from last turn
      - remove required resources from available resources from last turn
      - add produced resources to resources of this turn 
    - handle food consumption, i.e. check if enough food was produced
      - remove required food from available resources from last turn
      - *currently*: no effect; *future*: modifiers/effects based on how much is available
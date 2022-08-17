---
title: Cities
---

# Cities

## Creating Cities

**Requirements**

- nation must have enough money
- city must be build on a "land"-tile
- tile is not owned by another country
- tile does not already have a city
- at least one of the following conditions must be true:
  - the country has the greatest influence on that tile
  - no country has more than x influence on that tile
  - the country is the owner of the tile

**Creating a city**

- name
  - a valid (non empty) name must be given
- province
  - either create a new province with this city
  - or add this city to an existing province
    - province must have influence in the tile to be a valid choice 
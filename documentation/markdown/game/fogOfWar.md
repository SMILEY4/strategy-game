---
title: Fog-of-War and Visibility
---

# Fog-of-War and Visibility

- At the beginning, all tiles except an area around the starting position are **undiscovered** and provide no information to the country
- a tile is **visible** for a country, if the country has any influence in the tile and is not owned by another country. Visible tile provide the maximum possible information to the country.
- Visibility on tiles can also be achieved with **scouts**, independent of influence or borders
- all tiles that were visible to the country in the past (or the country has influence in) but are currently not directly visible are **discovered** and provide limited information.



## Scouting

- Scouts can placed on any discovered tile
- a scout can not be places to a tile already occupied by a friendly scout
- for 3 turns, a scout uncovers and provides visibility on all tiles in a circle with radius 4.
- a country can not have more than 4 active scouts at any time



## Discovered Countries

- a country A has discovered and knows of country B if A as discovered a tile that is owned by B 
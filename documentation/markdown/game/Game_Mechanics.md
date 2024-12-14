---
title: Game Mechanics

---

[TOC]



# Game Start

- each player starts at a random location with
  - one settler
  - one scout



# Visibility - Line of Sight and Fog of War

- the information available to the player depends on how much visibility the player has at the given location
  - *unknown* -  the player has not yet had line of sight on the tile and no information is available
  - *discovered* - the player had line of sight on the tile in the past and has limited information.
  - *visible* - the player currently has line of sight on the tile and all possible information is available
  - *internal* - the player owns the thing in question and has additional information available 



# Creating Settlements

## Using Settlers

- settlers can be created in settlements

- settlers can create a settlement at their current location
- creating a settlement consumes the settler
- settlement can be created on a tile when the following conditions are true
  - the terrain is land
  - the tile is not already occupied by another settlement
  - the tile is not owned by any country (own or foreign)

## Without Settlers

- settlements can be directly created without using a settler
- settlement can be created on a tile when the following conditions are true
  - the terrain is land
  - the tile is not already occupied by another settlement
  - the tile is already owned by the player



# Borders and Territory

- influence is added by settlements based on their distance to the tile
- whether a tile is owned by a player is determined by the amount of influence over the tile
- a player owns a tile, if the player has enough influence (above a threshold) and more influence than any other player
  - the same logic applies to which province and settlement owns tiles inside the territory of the player



# Settlement Networks and Routes

- new settlements automatically create other settlements that
  - are close enough
  - are discovered

- all settlements that are part of the same network share resources



# Producing and Consuming Resources

- resources are produced and consumed by various sources in settlements
  - population
  - buildings
  - production queue
- only resources produced last turn can be consumed in the next turn
- if something wants to consume resources, but not enough is available in the local settlement, it can use the leftover resources shared by other settlements in the same network
- there are two modes of consumption:
  - *complete* - the required resources have to be available at once, i.e. either all in the local settlement OR all in the shared network. If only part of the resources are available, none will be consumed. Example: building
  - *distributed* - as much resources as available are consumed, even if only part of the required amount is available. Resources can be consumed from the local settlement AND the network. Example: production queue



# Constructing Buildings and Producing Units

- buildings and units are produced in settlements
- entries are added into the production queue of the settlement and produced one after another
- each entry has a total resource requirement
- the current entry in the production queue consumes as many resources as possible until the requirements are met
- if all required resources have been consumed, the unit or building is created and the next entry in the queue is started
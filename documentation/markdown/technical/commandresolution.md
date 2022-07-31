---
title: Player Command Resolution
---

# Player Command Resolution

Each player submits a list of commands each turn. When the last player submitted his/her commands, the turn ends and all commands will be resolved (=applied to the game-state).

## Process Overview

1. a player submits a list of commands, gets saved to database
2.  check, if that player is the last to submit -> if yes, the turn ends and the commands are resolved; if no, repeat
3. fetch all commands (of all players) for the ended turn from the database
4. determine an order, in which to resolve the commands
5. fetch the complete state of the game/world
6. for each command
   1. validate command
   2. resolve command
   3. modify game-state
   4. return any number of "command resolution errors" (does not represent an application error / exception), if that command could not be resolved
7. collect "command resolution errors" from all commands
8. save all modifications to the game-state to the database
9. for each player: send new world state together with the "command resolution errors" for displaying
---
title: Ideas/Brainstorming
---

[TOC]



# Inspiration Sources

https://www.youtube.com/watch?v=U1ZEGlegPcA

- Total War: Rome II Mod "Divide et Impera"
- population, armies, ...

https://www.youtube.com/watch?v=tSlr0Dn__dE

- Total War: Thrones of Britannia Mod "Shieldwall"
- population mechanics !!, ...

https://forums.civfanatics.com/threads/problemedicals-civilization-vii-ideas-wishlist.671369/

https://forums.civfanatics.com/threads/ideas-for-the-perfect-4x-historical-game.654805/



# Turn-Based (WeGo) ❤

- each player inputs their moves; after every player is done, the commands play out, then next turn
- Phases
  1. Command/Planning Phase
     - each player creates commands -> what should be done this turn
  2. Resolution Phase
     - resolve commands of all players + apply effects to game
  3. Update Phase
     - update the game, execute triggers (e.g. apply income, update turn-timers, ...)



# Raising Armies and Population

- population divided into classes (e.g. nobility, workers)
- certain units can only be recruited from specific classes (e.g. heavy knights -> nobility)
- how to raise army ?
  1. select city -> "Raise Army"
  2. select units (only units of that city/region available -> population classes, resources, buildings, ...)
  3. "Confirm" -> takes x turns to raise
- to get more diverse army, merge smaller armies from different cities/regions





# Army Combat Mechanics

- CK2 wiki: https://ck2.paradoxwikis.com/Combat

- CK2 Combat analysis https://t-a-w.blogspot.com/2013/07/how-not-to-design-game-mechanics.html

- CK2 Combat mod: https://www.youtube.com/watch?v=5Ncsm8FsvA0
- improvement ideas (order strategies): https://www.reddit.com/r/CrusaderKings/comments/lymjuw/a_suggestion_for_improving_combat_tactics_in_ck3/

#### Summary (with mechanics from mod)

- 2 sides (2 fighting armies)

- each side has 3 flanks (left, center, right)

  - each flank has commander + own units
  - fight opposing side (same flank) completely independent
  - if no opposing side -> attack neighboring enemy flank + flanking bonus

- combat divided into 3 phases (flanks not necessarily in same phase)

  1. skirmish: archers do majority of damage

  2. melee:  infantry does majority of damage

  3. pursue: when enemy morale breaks, (light) cavalry does majority of damage

     

## Combat Ideas I

https://civilization.fandom.com/wiki/Combat_(Civ4) -> simple army combat calculations + counters 

- x flanks based on terrain
- rules how to spread unit (types) over flanks
  - cavalry only on outer flanks
  - heavy infantry only in center, can overflow to outer flanks
  - ranged only in center, can overflow to outer flanks

#### Turn 1

- armies have met on same field, no damage yet
- players can give basic orders (charge, defend, retreat, ...)
- orders executed and damage calculated at end of turn (after orders given)

#### Turn 2

- damage was applied
- repeat until armies separate (give orders, resolve orders, calculate damage)





## Combat Inspirations

- "Oriental Empires"

  - hex based
  - combine units into armies
  - battles auto resolve, player can set basic formations and strategies

  - links

    - overview https://www.youtube.com/watch?v=W0KJnosDktQ

    - battle math https://steamcommunity.com/app/357310/discussions/0/343787920116681067/

    - strategies https://orientalempires.fandom.com/wiki/Battle_Plans

    - guide https://re-actor.net/oriental-empires-ultimate-guide/#Fighting_Battles
    - battle tutorial https://www.youtube.com/watch?v=bomjK5UoxAk



##  Combat Ideas II

- roughly based in Oriental Empires
- build army out of different units, only x different units per army
  - example Army with 5 different units and a total size of 12 units:
    - 3 units of spear militia (spear infantry)
    - 2 units of dismounted imperial knights (heavy infantry)
    - 5 units of peasant archers (missile infantry)
    - 2 units of feudal knights (heavy cavalry)
    - units from https://wiki.totalwar.com/w/Units_in_Medieval_II:_Total_War.html
- unit types
  - light infantry
  - spear infantry
  - heavy infantry
  - missile infantry
  - light cavalry
  - heavy cavalry
  - missile cavalry
  - siege engine
- auto formations, based on unit type ( -> easier formation due to limited types in each army)
- during rounds of combat (damage calculated at end of round)
  - give each unit type a basic strategy
  - some strategies can only be (effectively?) peformed by some unit types (skirmish by cav, light inf)
    - *attack* attack the closest enemy
    - *charge* charge the closest enemy
    - *harass/skirmish* attack closest enemy, but stay out of combat if not in favor, only cav or light inf
    - *outflank*
    - *defend*: dont attack, await enemy attack
    - *withdraw* move out of combat



## Combat Ideas III

- https://forum.paradoxplaza.com/forum/threads/still-frustrated-with-combat-in-crusader-kings-suggestions-after-rant.1462337/ (-> suggestions, examples from op)

- https://forum.paradoxplaza.com/forum/threads/combat-mechanics-explained.1434737/ (ck3 battle math)

- https://ck2.paradoxwikis.com/Combat_tactics (ck3 combat tactics)

- any units can form an army

- basic formation

  - columns: left/right flank, center

  - rows: front, back

  - each unit type is in one "position"

    | Unit Type        | Position         |
    | ---------------- | ---------------- |
    | light infantry   | center, front    |
    | spear infantry   | center, front    |
    | heavy infantry   | center, front    |
    | missile infantry | center, back     |
    | light cavalry    | flanks, front    |
    | heavy cavalry    | flanks, front    |
    | missile cavalry  | flanks, back     |
    | siege engines    | center, far back |

- units of reinforcing armies can just be added to their positions

- who attacks who ?

  - each "position" has priority enemy "position"

    | this position attacks... | ... enemy position (ordered by priority)                |
    | ------------------------ | ------------------------------------------------------- |
    | center front             | center front - center back - flanks front - flanks back |
    | center back              | center front - center back - flanks front - flanks back |
    | flank front              | flank front - flank back - center front - center back   |
    | flank back               | flank front - center back - center front - center back  |

    - if a unit attacks
      - it chooses an enemy position to attack based on priority
      - if all enemies in that position dead -> select next in line
    - if a column is attacking a different column -> flanking bonus
      - e.g.: "flank front" attacks "center front" -> flanking
      - e.g.: "center front" attacks "center back" -> no flanking

  - unit attacks enemy position containing multiple units -> damage get spread over all units

    - e.g.: 
      - cav unit with 90/100 soldiers attacks position with 100/100 light inf and 100/100 spearmen
      - 1 cav soldier deals 10 damage with flanking -> unit deals 900 damage -> 450dmg vs inf and 450dmg vs spearmen
      - but spearmen have defensive bonus vs cav -> reduced damage vs spearmen to 350dmg
      - cav also takes damage from attack -> more from spearmen due to dmg bonus vs cav, ...

  - => requires no input from player, but can maybe be visualized

- give basic strategies

  - attack, charge, defend, harass/skirmish, ...
  - unit recieves bonus/malus to attack, damage
  - some unit-types are better at some strategies -> higher/lower bonus
    - e.g.: light cav, light infantry better at harass/skirmish due to higher mobility
    - e.g.: missile inf weaker vs charge due to less time to launch missile

- idea 1: set a basic strategy for army each round
  - strategy applies to whole army
  
- idea 2: set a basic strategy for each unit
  - would prop. require limited amount of different units in each army -> reduce amount of req. commands
  - e.g.:
    - only two units in my army: "light cav", and "spearmen"
    - 1st turn
      - "light cav" - attack,  "spearmen" - defend
      - => my cav defeats enemy cav -> no enemy on flanks, my infantry can repell enemy attack
    - 2nd turn
      - both attack
      - => spearmen attack enemy inf, together with flanking cav => defeat enemy infantry and army 



# Military Tech

- change armies,strategies,strengths over time
- over time: change tech to unlock in certain direction to favor/focus different parts
  - players need to adapt, change strategies, production chains, ...
  - real military tech evolution: https://www.youtube.com/watch?v=DhXcwWYIMJk





# Diplomacy, Contracts, Treaties, Peace

- traditional trade screen like Civilisation, Stellaris, ...

## Types of "Contracts"

- **Normal**

  - player can offer sth and may want sth in return

  - recipient can accept, decline or modify

- **Ultimatum**

  - player can offer sth and may want sth in return
  - player also specifies actions that will happen when recipient declines
  - recipient can accept or decline
    - declining triggers specified actions



## Contents of a "Contract"

- resources (materials, troops, ...)
  - x resources one time
  - x resources for n turns
- knowlege / technology
- information
  - map data
  - info about cities, resources, military, armies, ... of some player
- territory
  - cities / regions
  - claims to lands
- actions
  - war agains sb
  - peace with sb
- alliances
  - defensive alliance (ops. against)
  - military alliance (ops. against)
  - economic alliance
- change opinion against sb
  - friendly
  - neutral
  - rival
  - ...
- ...





# Magic 1

Add. Ideas https://fallfromheaven.fandom.com/wiki/Spells

## Resource

- magic comes from special crystals
- crystals can be mined
	-> handle like any other resource
	-> use crystals as luxury resource (or other stuff) if not used for magic
	-> use crystals to build magic armor, weapons, ... 
- crystals are natural and grow more where less people/civilisation are
	-> balance magic with civilisation
	-> e.g.: tile has base +5 crystals; build mining tonw next to it -> +4; build large city nearby -> +1
- spells use (the magic stored in) crystals
- magic schools / research uses x crystals per turn



# Magic 1.2

- different types of magic (Blood Magic, Weather Magic, Time Magic)
  - https://clwilson.com/worldbuilding-101-making-magic/
  - https://www.reddit.com/r/worldbuilding/comments/6xgzqs/comment/dmfuq1c/?utm_source=share&utm_medium=web2x&context=3
- players receive random events to unlock magic type
  - "Our researchers have started experimenting with [insert magic type]. Support ? Stop Research ?"
- mages of certain types / people have opinions of other types -> conflict -> player has to concentrate on a "small" amount of types, otherwise:
  - slower research speed
  - more unstability / riots
  - ...
- player can forbid types of magic in own realm



## Spells

- illusory army
	* makes an enemy see an army that is not there
	* make one of your armies appear at a (random?) location
	* army can be visible twice -> the real and the fake one
	* only if player spies on your armies ?
- hidden army
	* temporary increases stealth of one army  
- farsight
	* unhance visibility range of any/all units
- hidden spy
	* conjure one spy that has a 100% success chance
	* spy can only be "used" once
- Mid Combat Support Spells 
  - improve all allied units in a single area (e.g. front left flank,  back center, ...): defense, attack, morale, ...
  - hinder all enemy units in a single area (e.g. front left flank,  back center, ...): defense, attack, morale, ...





# More Magic Ideas

- some magic ideas (e.g. elemental magic, alchemy, necromancy, ...)  starts in random nation
- starts to spread to neighbours, depending on
  - popularity (more popular ideas spread faster)
  - trade/communication (spreads faster to nations with more connections to origin nation)
  - acceptance (spreads faster to nations that accept idea more easily)
  - prerequisites (spreads only/faster to nations that fulfill necessary requirements - if some exist)



# War/Army Logistics

- https://www.reddit.com/r/CrusaderKings/comments/cmjcfr/an_idea_for_new_logistics_system/

- Armies consist of combat units and supply units (all have to be built manually)

- supply units carry x amount of supplies

- each unit uses y amount of supplies each turn (amount based on unit, e.g. cav uses more than inf)

- can refill supply units via

  - supply chains back to a with a supply depot (choose depot for each army, or set to auto)
    - supply depot can be bought at anytime (friendly/occupied cities), take some time to be built/filled up
    - supply chains can be attacked -> stops supply chain, gives enemy some supplies 
  - forage/plunder nearby territory/tiles (feeds army first, left over goes into supply)

    - supply of any tile depends on nearest city, weather, season, past raids, ... 
    - choose how aggressive vs local population (independent if tile is friendly,neutral,hostile)
      - friendly ("buy")
        - can "buy" from local population
        - cost gold
        - positive impact on local opinion
        - depends on current local opinion
      - passive ("forage")
        - forage without affecting local population
        - no gold cost
        - no impact on local opinion
        - find less supply
      - aggressive ("plunder")
        - steal from local population
        - can also "find" some gold
        - negative impact on local opinion
  - defeat armies, occupy cities
    - defeated armies can leaf some of their supplies behind
    - can use some supplies of occupied city (details depend on actions after occupation: destroy, liberate, ...)

 - running out of supplies -> army starves -> lower morale, then death

 - can ration supplies (how much is used by army)

   - 1.5x -> morale boost
   - 1x -> normal
   - 0.5x -> slighly lower morale (maybe not as bad as starving)
   
    





# Population Opinion/Hapiniess

- Happiness/Opinion = "wellbeing of population"
  - i.e. not what they think of leader, but how well they can live, examples:
    - enough food provided => better opinion
    - not have to worry about death (e.g. war) => better opinion
    - scared for live => worse opinion (e.g. during city-siege, bad war)
    - uncertainty !!  / unsafe future = worse opinion
      - after a city changed leader => uncertain what happens next => (temp) unhappy



# Corruption

- BASICS: the further away a city of from your capital, the higher the upkeep and the lower the yield
- depends on multiple stats
  - empire corruption (tech, global policies)
  - city corruption
  - local/city policies
  - buildings in city
  - ...







# Borders, Territory and Expanding ❤

- your territory = all the land around your cities, settlements, etc
  - settlements claim tiles in fixed distance around itself = your territory
  - if claimed tile != free => get claim on that land => "casus beli"
- cities, settlements, etc have a sphere of influence (greater than claimed area)
  - you can only settle within tiles where you have the greatest influence or nobody else influences that tile enough
  - influence spreads based on some factors
    - more: rivers (even better downstream), flat land, ...
    - less: hills, mountains, ocean, ...
  - if you have the greatest influence on a tile that is owned by another country, you get a (unpressed) claim on that tile
- more ideas on border/territory:
  - https://forums.civfanatics.com/threads/ideas-for-the-perfect-4x-historical-game.654805/post-15933691





# "Fog of War" ❤

- 3 states for each country
  - unknown
    - completely unknown, no knowledge about tile at all
  - explored
    - only limited information (but in "realtime" -> no "last known state")
    - knows current type and some static content (city, castle, ...)
    - no activities visible -> unit movement, occupied territory, effects...
  - visible
    - tile and all activities fully visible
- FoW does not determine knowlege about stats of objects, completly independent -> example: foreign city
  - stats of city completely determined by public knowledge (name, owner, ...) + espionage (uncovers some stats for x turns) + diplomacy (information given for x turns)

==> no need to store current state + last known state for each object for each player

- required data for object for each player

  - visible/explored yes/no ?

  - knowledge about some "secret info" for some attributes

inspiration

- https://eu4.paradoxwikis.com/Map#Fog_of_war



# Fictional Culture and Nation Tropes

https://tvtropes.org/pmwiki/pmwiki.php/Main/FictionalCultureAndNationTropes



# Win Conditions

## Procedural Victory Condition

- each player different condition -> drives conflicts between players with overlapping or conflicting goals
- generate "random" win condition for each player (maybe player can pick one out of x)
- Players don't know win conditions of other players
- WCs have to work with procedural worlds + "random" starting positions
- Ideas
  - control x% of all tiles in region y
  - have the most valuable trade city (hold for x years)
  - ...

**Pro:**

- one singular goal 

**Con:**

- maybe harder to balance
- hard to come up with interesting ideas
- hard to generate interesting ideas
  - no knowledge about game -> generated before game starts

## Quest System

- gain victory points by completing "quests" -> player with most points is overall winner
- Quests = small goals, generated dynamically during the game
- player always has x active quests, get a new one when any is completed
- most quests should produce conflict or cooperation between players
- can react to current situation -> 
- ideas:
  - have a city with x trade power for y turns
  - hold region/tile x for y turns (multiple players can have this quest for additional conflict)



# Creating Cities, Settlements

- CK3 Holdings

  - https://www.youtube.com/watch?v=Df9P7B9GfFk

  - https://ck3.paradoxwikis.com/Barony#Holdings

- Settlements can be built

  - inside own territory
    - development of tile reduces cost of city + starts with more population ?
  - in unclaimed tile
    - more expensive, less starting population ?
    - more expensive the further away the settlement is built (to avoid holes in nation)
  - in both situations
    - claim unclaimed neighboring tiles for new city
    - auto transfers neighboring tiles to new city

- settlement grows over time -> claims more tiles, but does not add already claimed tiles to its area

  - can transfer tiles between own cities

- cities also cost some resource -> balance so that players cant build 1mio cities when enough money

  - city requires constant administrative power -> if nation goes over limit -> instabilities due to administrative chaos / too many cities



# Resource Production

**Raw Resource Gathering (metal, stone, wood, food, ...)**

- cities/settlements automatically harvest resources in tiles owned by city, depending on buildings
- city starts with very limited amount (only one?) of building-slots -> very specialized -> "raw resource gathering city"
- as city grows -> unlock more slots -> more diverse buildings -> "city for production/administration/trade/..." 
- city can set focus -> e.g. "focus on fishing" -> "Fishing Village" -> bonus to fish/food production, malus on all other production unrelated to fish
- *Example: "Player needs more wood"*
  1. build new settlement near forest
  2. build "woodcutter"-building in settlement
     - 1 woodcutter produces +1 wood for each forest reachable forest-tile
     - 1 woodcutter can harvest max. 3 forest tiles (if more forest available and player needs more wood -> build more "woodcutters" in city)
     - 1 forest tile can only be worked by one building
  3. Profit -> settlements harvests nearby forest

**Production**

- cities produce resources based on available resources and production buildings in city 

**Gameplay and target Player Strategy**

- no specific "tile improvements" like e.g. in civilization games, only cities
- country structured in provinces with large province capitol (= civilization city) and small settlements for specialized resource gathering (=civilization tile improvements)



# Cities vs Towns (vs Provinces)

- no provinces
- cities
  - country has cities
  - cities define/own larger areas of country
  - allow more advanced buildings (administration, research, adv. production)
  - no max (population) size
- towns
  - a town belongs to a city
  - specialized basic production buildings (farm, mine, quarry, ...)
  - claims only limited amount of surrounding tiles
  - max (population) size (after that it can be upgraded to city with own area)

- switch town -> city

  - should be deliberate decision
  - unlocks buildings with different focuses and bonuses, but maybe not many additional building slots at first -> player decision: keep basic production or replace with new buildings ?

  

# Tile Level

- similar to EU4 Development: https://eu4.paradoxwikis.com/Development
- tiles gain xp -> enough xp -> level up
  - effect of city -> larger city, smaller distance => more xp
  - ...
- level up manually -> spend resource
- effects of level
  - cheaper to build new city on high level tile
  - more production
  - more population



# Borders during War

- army claims all tiles in their path
  - connects army to home-territory => supply line
- enemy unit can re-claims tiles
  - cuts supply line
- how to handle cities, fortifications ?
  - maybe enemy tiles claimed that way decay (go back to enemy after x turns)
    - if city/fortress is captured, tiles stay yours
    - if part of supply line, tiles stay yours (i.e. tile is part of path from closest home-tile to army) 
    - prevents a million small "islands" of captured territory
- what advantage do i have to capture tiles (without cities) that are not part of supply line ?
  - why would the enemy need to reclaim tiles ?

 - role of forts/cities ?
    - maybe tiles surrounding def. structure are protected -> can only be taken by taking defending structure ?



# Reddit thread on borders

https://www.reddit.com/r/StrategyGames/comments/hn8yua/4x_with_no_borders/

Maybe have a look at Aggressors: Ancient Rome or its coming successor  Imperiums: Greek Wars (Release July 30). It is a mix of 4X and  Historical Strategy, gameplay-wise it plays a lot more like Civ or other 4X than like Paradox. You play on a historical map of Ancient Rome (or  Ancient Greece in the new game) and the many big and small starting  factions have rather "realistic" borders set.

When you are in a war with another faction every military unit just claims  the tile it is on and adds it to your land. If there is something on  that tile (another unit, a fortficiation, a wall, a city, etc.etc.) then you first have to combat it of course in order to move there and claim  it. The borders are pretty important in this game because of some  reasons:

\- In war you can send  your troops (especially those with a lot of movement) deeper into the  enemies country. As I said with each step a tile more becomes your  territority but if you push in too deep without conquering also the  adjacent lands or a city your supplies get low. When your army stands on tiles that are not supplied 100% it starves gradually. The morale  drops, the loyality drops, it can take damage per turn. And when the  loyality drops it can also happen that your unit will just join the  enemy in order to get something to food again ;)

\- Also the happinnes of your empire and your population is influenced  pretty much by your borders. Cities that are close to borders tend to be unhappier because if you start a war with your neighbour they will get  attacked much more likely than your inland. If you are in a war already  and they can see the enemy troops at the border already they are  frightened. Low Happinnes of those citiy can again result in lower  loyality. The enemy might influence the city actively too to push the  chance of a rebellion so that either the guards or the military have to  push the people down or the whole city might go over to your enemy. In  order to make cities close to the border feel safer you can install a  civil guard (in case you have already researched that), you can fortify  the border or increase the defense of the city, you can try to push the  border further away from your cities (if you are in war with the other  country or the land behind the border is yet untaken) or and that is  very important, you can station some military units in or near that city so they know they are somewhat safe from attacks.

\- There are some negative aspects to the border mechanics IN MY OPINION.  If you are two or more factions together fighting a war against a third  and you are NOT in a Federation (I think I remember corecct but not 100% sure that its federation) then all factions just take their land tile  by tile for themselves. This can result in a somehow speckled map with  little islands of each faction. Only if the other faction fights FOR you they can take land and make it YOUR territory instead of their own. The speckled map can be not just an aesthetic problem because maybe you  find yourself surrounded by a faction that you have no treaty signed  with to step on their territory in peace times. That means: Either you  have to work in diplomacy to get that treaty or you just have to wait  out or you have to declare war in order to get your tiles out of  isolation ;)

There are many more  mechanical aspects to this. The game is more complex than it might look  at first sight and the upcoming successor is supposed to top that even.  Have a look, if you have questions, ask me.

/edit: Oh and for the fun of fortification/strategic choke points etc. there  are of course also natural borders. Mountains can only be crossed by  units that have the training "mountaineers" which as far as I know is  pretty late game for most factions. There are also rivers which of  course may give your population more fertile lands thus more food but  cannot be crossed by any unit instead one of your workers build a bridge on a tile first. I think there is also some training for military to  cross rivers without a bridge but for the most part of the game a river  without a bridge is a natural border.





# Magic Progression

- find tomes/books/scrolls/artifacts in random location around the map
- each artifact is basis for a new magic "techtree"
- player can decide to unlock magic
  - no scout-units -> if in "sphere of influence" -> triggers event or can be selected and researched later
- adopting a specific magic reduces progress in other areas / other magic techtrees -> players without access to magic can keep up via normal tech



# Starting a War

**Attacker**

1. get a casus beli
2. start preparation phase of war campaign with selected caus beli
   - takes x turns
   - used to raise armies, setup logicstics, find allies, make treaties
   - other countries can find out details about campaign with spies

3. end of preparation phase: decision
   - start war -> official declaration of war
   - cancel war -> nothing happens, preparation for nothing, only already spent resources lost

Effects:

- more realistic
- planning of war more important than actual war
- more possibilities for interaction

**Defender**

Same exact process as attacker - casus beli = "defend against"

What if defender does not find out about pending war ? (suprised by declaration of war)

- player already failed at first step => war does not start with declaration !

- has to start preparation later
- has to rely on castles/fortifications/standing armies until preparation is done



# Terrain Generation

- https://www.procjam.com/tutorials/en/ooze/
  - continents, biomes
  - more on non-realistic side
  - created by placing "blobs" that modify "terrain" each time
  - <img src="https://www.procjam.com/tutorials/en/ooze/images/image5.png" style="zoom: 33%;float:left" />
- http://www.jgallant.com/procedurally-generating-wrapping-world-maps-in-unity-csharp-part-1/
  - continents, biomes
  - generate heightmaps, heatmaps, moisture, ...
  - more realistic looking
  - <img src="http://www.jgallant.com/wp-content/uploads/2016/01/biomesrender2.png" style="zoom:67%;float:left" />
  - my (rough) Shadertoy "implementation": https://www.shadertoy.com/view/NtjXDt

- Procedural Generation Blog
  - https://heredragonsabound.blogspot.com/
  - Hex Wind Simulation: https://heredragonsabound.blogspot.com/2018/11/continent-maps-part-4-wind-model.html
- Blog (Realistic World gen)
  - https://undiscoveredworlds.blogspot.com/
  - Rain Simulation: https://undiscoveredworlds.blogspot.com/2019/02/hey-ho-wind-and-rain.html
  - Climate: https://undiscoveredworlds.blogspot.com/2019/02/getting-climactic.html



# Combat, War, Army Movement and Commands

## Idea 1

- army control based on areas (e.g. cities)
- army can be in an area (not in a specific tile)
- all commands based on areas, examples:
  - defend current area
  - move into area
  - attack area
  - retreat into area
  - avoid enemy armies in current area
  - ...
- how to handle multiple different types of terrain in an area (-> e.g. for combat bonuses) ?
  - set preferred terrain for army, choose from available terrain in area
  - when 2 armies meet -> commanders make a maneuverer roll -> result decides in whose preferred terrain the battle takes place

**Goal/Results**

- less micromanagement of armies
- solves problem of two armies chasing each other and not meeting

**Open Problems**

- how to handle unclaimed terrain ?

## Idea 2

- each army has a area of control ("aoc")
  - size of aoc maybe depending on army composition, commander, tech, ...  
- army positioned on tiles, movement based on tiles
- army commands
  - defend here
  - attack into tile xy
  - move to xy and avoid enemies
  - ...
- if army enters aoc of other army, they "meet" (-> battle)
- position/tile of battle one of the positions of meeting armies
  - depends on armies commands -> e.g. "A" defends and "B" moves into aoc of "A", then battle takes place in tile of "A"

**Goals/Result**

- less micromanagement than without aoc
- reduces problem of two armies chasing each other and not meeting
- can handle unclaimed terrain (-> Idea 1)

**Open Problems**

- Situation: two moving armies with aoc smaller than movement distance -> how to handle them crossing each other ?
  - maybe resolve complete movement of all armies in order -> only end-positions are checked for "meetings" ?

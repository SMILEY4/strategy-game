## User Perspective

1. click on "create world"
   - receive new game-id
2. click on "join world"
   - world loads, renders
3. scroll/drag
   - camera moves
4. click on tile
   - marker is placed
5. click on "submit turn" button
   - "waiting for other players"
   - can no longer place markers
6. *other players finish turn*
   - other markers show up
   - next turn begins
   - can place markers again



## Technical Perspective

0. Home-Page is rendered by react
1. "create world" React-btn onClick triggered

   - call dispatcher with "create-world"-request
     - makes get-request via client
   - returns a world-id
   - display world id
2. "join world" React-btn onClick triggered

   - call dispatcher with "join-world"-request
     - opens ws-connection
     - sets global-state = loading
     - navigates to ""
3. websocket receives "initial-world-state"-event

   - call dispatcher "received-initial-world-state"
   - sets global-state = active + world data
4. canvas detects mouse movement + mouse down

   - call dispatcher "mouse-drag"-event
     - calls game-core -> updates camera position
5. canvas detects mouse click
   - call dispatcher "mouse-click"-event
     - calls game-core
       - finds a valid tile at position for a new marker
       - calls dispatcher "place-marker"-event
         - calls game-core -> notify placed marker
         - updates global state with new marker 
6. "submit turn" React-btn onClick triggered

   - call dispatcher "submit-turn"-event

     - update global-state = finished turn

     - send "submit-turn"-message via websocket
7. websocket receives "start-next-turn"-message
   - call dispatcher "start-next-turn"-event
     - update global-state = next turn + new world state
     - notifies game-core of world-change -> rebuilds render-state





- meanwhile: canvas animation loop
    - call dispatcher "updateFrame"-event
      - calls game-core -> calls renderer
        - renderer displays current render-state





**What is the "Dispatcher" ?**

- class/namespace with functions/hooks to interact with other systems/components or access global state

- acts as "glue" between the react-ui, the game-logic with webgl-renderer and the global (zustand-) state

- Example: "join-world"-request

  ```
  namespace Dispatcher {
  
  	client: Client
  	ws: WebSocket
  	
  	function useJoinGame() {
  		return (worldId) => {
              // handle websocket connection
              ws.open()
              ws.sendJoinWorld(worldId)
              // update global state
              useState().setLoading()
              // set new route
              useNavigate().navigate("/game")
  		}
  	}
  
  }
  ```

- Example: "received-world-state"-event

  ```
  namespace Dispatcher {
  
  	client: Client
  	ws: WebSocket
  	game: GameCore
  	
  	function receiveWorldState(world) {
  		// update global state
  		state.setActive()
  		state.setWorld(world)
  		// notify game-core of event -> can update internal render state
  		game.receivedWorld()
  	}
  
  }
  ```

  


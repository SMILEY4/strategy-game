import {Command} from "../command/command";
import {Tile} from "../tile/tile";
import {Realm} from "../realm/realm";
import {WorldObject} from "../worldobject/worldObject";
import {Route} from "../route/route";

/**
 * Bundles data of the current game state.
 */
export interface GameStateContainer {
	turn: number,
	commands: Command[],
	tiles: Tile[],
	realms: Realm[],
	worldObjects: WorldObject[],
	routes: Route[]
}
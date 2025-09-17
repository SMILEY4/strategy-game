import {Command} from "../command/command";
import {TileEntity} from "../tile/tileEntity";
import {RealmEntity} from "../realm/realmEntity";
import {WorldObjectEntity} from "../worldobject/worldObjectEntity";

export interface GameState {
	turn: number,
	commands: Command[],
	tiles: TileEntity[],
	realms: RealmEntity[],
	worldObjects: WorldObjectEntity[],
}
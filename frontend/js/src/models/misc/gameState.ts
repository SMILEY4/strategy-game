import {Command} from "../command/command";
import {TileEntity} from "../tile/tileEntity";
import {RealmEntity} from "../country/realmEntity";
import {SettlementEntity} from "../settlement/settlementEntity";
import {WorldObjectEntity} from "../worldobject/worldObjectEntity";
import {RouteEntity} from "../route/routeEntity";

export interface GameState {
	commands: Command[],
	tiles: TileEntity[],
	realms: RealmEntity[],
	worldObjects: WorldObjectEntity[],
}
import {Command} from "../command/command";
import {TileEntity} from "../tile/tileEntity";
import {CountryEntity} from "../country/countryEntity";
import {SettlementEntity} from "../settlement/settlementEntity";
import {WorldObjectEntity} from "../worldobject/worldObjectEntity";
import {RouteEntity} from "../route/routeEntity";

export interface GameState {
	commands: Command[],
	tiles: TileEntity[],
	countries: CountryEntity[],
	settlements: SettlementEntity[],
	worldObjects: WorldObjectEntity[],
	routes: RouteEntity[],
}
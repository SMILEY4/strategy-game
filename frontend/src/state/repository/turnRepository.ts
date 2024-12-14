import {TileDatabase} from "../database/tileDatabase";
import {WorldObjectDatabase} from "../database/worldObjectDatabase";
import {CommandDatabase} from "../database/commandDatabase";
import {CountryDatabase} from "../database/countryDatabase";
import {SettlementDatabase} from "../database/settlementDatabase";
import {Transaction} from "../../common/db/database/transaction";
import {Tile} from "../../models/base/tile";
import {Country} from "../../models/base/country";
import {Settlement} from "../../models/base/Settlement";
import {WorldObject} from "../../models/base/worldObject";
import {RouteDatabase} from "../database/routeDatabase";
import {Route} from "../../models/base/route";

export class TurnRepository {

	private readonly tileDb: TileDatabase;
	private readonly commandDb: CommandDatabase;
	private readonly countryDb: CountryDatabase;
	private readonly settlementDb: SettlementDatabase;
	private readonly worldObjectDb: WorldObjectDatabase;
	private readonly routeDb: RouteDatabase;

	constructor(
		tileDb: TileDatabase,
		commandDb: CommandDatabase,
		countryDb: CountryDatabase,
		settlementDb: SettlementDatabase,
		worldObjectDb: WorldObjectDatabase,
		routeDb: RouteDatabase,
	) {
		this.tileDb = tileDb;
		this.commandDb = commandDb;
		this.countryDb = countryDb;
		this.settlementDb = settlementDb;
		this.worldObjectDb = worldObjectDb;
		this.routeDb = routeDb;
	}

	public transactionForStartTurn(action: () => void) {
		Transaction.run([this.tileDb, this.commandDb, this.countryDb, this.settlementDb, this.worldObjectDb, this.routeDb], action);
	}

	public replaceTiles(tiles: Tile[]) {
		this.tileDb.deleteAll();
		this.tileDb.insertMany(tiles);
	}

	public replaceCountries(countries: Country[]) {
		this.countryDb.deleteAll();
		this.countryDb.insertMany(countries);
	}

	public replaceSettlements(settlements: Settlement[]) {
		this.settlementDb.deleteAll();
		this.settlementDb.insertMany(settlements);
	}

	public replaceWorldObjects(worldObject: WorldObject[]) {
		this.worldObjectDb.deleteAll();
		this.worldObjectDb.insertMany(worldObject);
	}

	public replaceRoutes(routes: Route[]) {
		this.routeDb.deleteAll();
		this.routeDb.insertMany(routes);
	}

}
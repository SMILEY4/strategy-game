import {TileDatabase} from "../database/tileDatabase";
import {WorldObjectDatabase} from "../database/worldObjectDatabase";
import {CommandDatabase} from "../database/commandDatabase";
import {CountryDatabase} from "../database/countryDatabase";
import {ProvinceDatabase} from "../database/provinceDatabase";
import {SettlementDatabase} from "../database/settlementDatabase";
import {Transaction} from "../../common/db/database/transaction";
import {Tile} from "../../models/base/tile";
import {Country} from "../../models/base/country";
import {Province} from "../../models/base/province";
import {Settlement} from "../../models/base/Settlement";
import {WorldObject} from "../../models/base/worldObject";
import {Route} from "../../models/base/Route";
import {RouteDatabase} from "../database/routeDatabase";

export class TurnRepository {

	private readonly tileDb: TileDatabase;
	private readonly commandDb: CommandDatabase;
	private readonly countryDb: CountryDatabase;
	private readonly provinceDb: ProvinceDatabase;
	private readonly settlementDb: SettlementDatabase;
	private readonly worldObjectDb: WorldObjectDatabase;
	private readonly routeDb: RouteDatabase;

	constructor(
		tileDb: TileDatabase,
		commandDb: CommandDatabase,
		countryDb: CountryDatabase,
		provinceDb: ProvinceDatabase,
		settlementDb: SettlementDatabase,
		worldObjectDb: WorldObjectDatabase,
		routeDb: RouteDatabase,
	) {
		this.tileDb = tileDb;
		this.commandDb = commandDb;
		this.countryDb = countryDb;
		this.provinceDb = provinceDb;
		this.settlementDb = settlementDb;
		this.worldObjectDb = worldObjectDb;
		this.routeDb = routeDb;
	}

	public transactionForStartTurn(action: () => void) {
		Transaction.run([this.tileDb, this.commandDb, this.countryDb, this.settlementDb, this.provinceDb], action);
	}

	public replaceTiles(tiles: Tile[]) {
		this.tileDb.deleteAll();
		this.tileDb.insertMany(tiles);
	}

	public replaceCountries(countries: Country[]) {
		this.countryDb.deleteAll();
		this.countryDb.insertMany(countries);
	}

	public replaceProvinces(provinces: Province[]) {
		this.provinceDb.deleteAll();
		this.provinceDb.insertMany(provinces);
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
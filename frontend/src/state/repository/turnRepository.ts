import {GameSessionDatabase} from "../database/gameSessionDatabase";
import {CameraDatabase} from "../database/cameraDatabase";
import {TileDatabase} from "../database/tileDatabase";
import {WorldObjectDatabase} from "../database/objectDatabase";
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

export class TurnRepository {

	private readonly tileDb: TileDatabase;
	private readonly worldObjectDb: WorldObjectDatabase;
	private readonly commandDb: CommandDatabase;
	private readonly countryDb: CountryDatabase;
	private readonly provinceDb: ProvinceDatabase;
	private readonly settlementDb: SettlementDatabase;

	constructor(
		tileDb: TileDatabase,
		worldObjectDb: WorldObjectDatabase,
		commandDb: CommandDatabase,
		countryDb: CountryDatabase,
		provinceDb: ProvinceDatabase,
		settlementDb: SettlementDatabase
	) {
		this.tileDb = tileDb;
		this.worldObjectDb = worldObjectDb;
		this.commandDb = commandDb;
		this.countryDb = countryDb;
		this.provinceDb = provinceDb;
		this.settlementDb = settlementDb;
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
		this.provinceDb.insertMany(provinces)
	}

	public replaceSettlements(settlements: Settlement[]) {
		this.settlementDb.deleteAll();
		this.settlementDb.insertMany(settlements)
	}

	public replaceWorldObjects(worldObject: WorldObject[]) {
		this.worldObjectDb.deleteAll();
		this.worldObjectDb.insertMany(worldObject);
	}

}
import {GameSessionDatabase} from "../database/gameSessionDatabase";
import {CameraDatabase} from "../database/cameraDatabase";
import {TileDatabase} from "../database/tileDatabase";
import {WorldObjectDatabase} from "../database/objectDatabase";
import {CommandDatabase} from "../database/commandDatabase";
import {CountryDatabase} from "../database/countryDatabase";
import {ProvinceDatabase} from "../database/provinceDatabase";
import {SettlementDatabase} from "../database/settlementDatabase";
import {TileIdentifier} from "../../models/base/tile";
import {Settlement} from "../../models/base/Settlement";

export class SettlementRepository {

	private readonly settlementDb: SettlementDatabase;

	constructor(settlementDb: SettlementDatabase) {
		this.settlementDb = settlementDb;
	}

	public getByTile(tileId: TileIdentifier): Settlement | null {
		return this.settlementDb.querySingle(SettlementDatabase.QUERY_BY_POSITION, [tileId.q, tileId.r]);
	}

}
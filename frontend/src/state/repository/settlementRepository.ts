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

	public getAll(): Settlement[] {
		return this.settlementDb.queryMany(SettlementDatabase.QUERY_ALL, null);
	}

}
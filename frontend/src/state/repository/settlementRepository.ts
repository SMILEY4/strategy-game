import {SettlementDatabase} from "../database/settlementDatabase";
import {TileIdentifier} from "../../models/base/tile";
import {Settlement} from "../../models/base/Settlement";
import {useDI} from "../../appContext";
import {GameSessionDatabase} from "../database/gameSessionDatabase";
import {usePartialSingletonEntity, useQuerySingle} from "../../common/db/adapters/databaseHooks";

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

	public getSettlementsRevId(): string {
		return this.settlementDb.getRevId();
	}

}

export namespace SettlementRepository {

	export function useByPosition(pos: [number, number]): Settlement[] {
		const db = useDI<SettlementDatabase>(SettlementDatabase.name)
		const settlement = useQuerySingle(db, SettlementDatabase.QUERY_BY_POSITION, pos);
		if(settlement) {
			return [settlement]
		} else {
			return []
		}
	}

}
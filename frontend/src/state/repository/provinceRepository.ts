import {ProvinceDatabase} from "../database/provinceDatabase";
import {SettlementIdentifier} from "../../models/base/Settlement";
import {useQuerySingle} from "../../common/db/adapters/databaseHooks";
import {AppCtx, useDI} from "../../appContext";
import {Province} from "../../models/base/province";

export class ProvinceRepository {

	private readonly db: ProvinceDatabase;

	constructor(db: ProvinceDatabase) {
		this.db = db;
	}

}

export namespace ProvinceRepository {

	export function useBySettlementId(identifier: SettlementIdentifier | null | undefined): Province | null {
		const db = useDI<ProvinceDatabase>(ProvinceDatabase.name)
		return useQuerySingle(db, ProvinceDatabase.QUERY_BY_SETTLEMENT_ID, identifier?.id);
	}

}
import {SettlementDatabase} from "../database/settlementDatabase";
import {TileIdentifier} from "../../models/base/tile";
import {Settlement} from "../../models/base/Settlement";
import {useDI} from "../../appContext";
import {useQueryMultiple, useQuerySingle} from "../../common/db/adapters/databaseHooks";
import {CountryIdentifier} from "../../models/base/country";

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
        const db = useDI<SettlementDatabase>(SettlementDatabase.name);
        const settlement = useQuerySingle(db, SettlementDatabase.QUERY_BY_POSITION, pos);
        if (settlement) {
            return [settlement];
        } else {
            return [];
        }
    }

    export function useByCountry(country: CountryIdentifier): Settlement[] {
        const db = useDI<SettlementDatabase>(SettlementDatabase.name);
        return useQueryMultiple(db, SettlementDatabase.QUERY_BY_COUNTRY_ID, country.id);
    }

}
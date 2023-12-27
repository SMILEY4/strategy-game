import {AbstractSingletonDatabase} from "../shared/db/database/abstractSingletonDatabase";
import {TileIdentifier} from "../models/tile";
import {MapMode} from "../models/mapMode";
import {useSingletonEntity} from "../shared/db/adapters/databaseHooks";
import {AppCtx} from "../appContext";

export class LocalGameDatabase extends AbstractSingletonDatabase<{ // todo: split into own dbs ?
    selectedTile: TileIdentifier | null;
    hoverTile: TileIdentifier | null;
    mapMode: MapMode;
}> {

    constructor() {
        super({
            selectedTile: null,
            hoverTile: null,
            mapMode: MapMode.DEFAULT,
        });
    }

    public setMapMode(mode: MapMode) {
        this.update(() => ({
            mapMode: mode,
        }));
    }

    public getMapMode(): MapMode {
        return this.get().mapMode;
    }

    public setSelectedTile(tile: TileIdentifier | null) {
        this.update(() => ({
            selectedTile: tile,
        }));
    }

    public getSelectedTile(): TileIdentifier | null {
        return this.get().selectedTile;
    }

    public setHoverTile(tile: TileIdentifier | null) {
        this.update(() => ({
            hoverTile: tile,
        }));
    }

    public getHoverTile(): TileIdentifier | null {
        return this.get().hoverTile;
    }

}

export namespace LocalGameDatabase {

    export function useMapMode(): [MapMode, (mode: MapMode) => void] {
        const db = AppCtx.LocalGameDatabase();
        const mapMode = useSingletonEntity(db).mapMode;
        return [
            mapMode,
            (m: MapMode) => db.setMapMode(m),
        ];
    }


    export function useSelectedTile(): TileIdentifier | null {
        return useSingletonEntity(AppCtx.LocalGameDatabase()).selectedTile
    }

}

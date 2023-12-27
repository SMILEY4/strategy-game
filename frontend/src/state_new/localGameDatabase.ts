import {AbstractSingletonDatabase} from "../shared/db/database/abstractSingletonDatabase";
import {TileIdentifier} from "../models/tile";
import {MapMode} from "../models/mapMode";

export class LocalGameDatabase extends AbstractSingletonDatabase<{
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

}

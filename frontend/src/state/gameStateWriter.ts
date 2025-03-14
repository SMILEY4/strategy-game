import {CameraEntity} from "../models/misc/cameraEntity";
import {TileSummary} from "../models/tile/tileSummary";
import {MapMode} from "../models/misc/mapMode";

export interface GameStateWriter {
	setSelectedTile(tile: TileSummary | null): void;
	setHoveredTile(tile: TileSummary | null): void;
	setCameraData(cameraData: CameraEntity): void;
	setSelectedMapMode(mapMode: MapMode): void;
}


export class GameStateWriterImpl implements GameStateWriter {

	setHoveredTile(tile: TileSummary | null): void {
		// todo
	}

	setSelectedTile(tile: TileSummary | null): void {
		// todo
	}

	setCameraData(cameraData: CameraEntity): void {
		// todo
	}

	setSelectedMapMode(mapMode: MapMode): void {

	}

}
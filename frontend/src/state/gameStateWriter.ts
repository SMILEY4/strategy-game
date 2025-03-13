import {TileIdentifier} from "../models/base/tile";
import {CameraData} from "../models/base/cameraData";

export interface GameStateWriter {
	setSelectedTile(tile: TileIdentifier | null): void;
	setHoveredTile(tile: TileIdentifier | null): void;
	setCameraData(cameraData: CameraData): void;
}


export class GameStateWriterImpl implements GameStateWriter {

	setHoveredTile(tile: TileIdentifier | null): void {
		// todo
	}

	setSelectedTile(tile: TileIdentifier | null): void {
		// todo
	}

	setCameraData(cameraData: CameraData): void {
		// todo
	}

}
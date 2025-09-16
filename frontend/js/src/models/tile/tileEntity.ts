import {Visibility} from "../misc/visibility";
import {HiddenType} from "../../common/hiddenType";
import {TileResourceType} from "./TileResourceType";
import {TileId} from "./tileId";
import {TilePosition} from "./tilePosition";
import {TerrainType} from "./terrainType";
import {Projections} from "../../common/webgl/projections";
import Point = Projections.Point;

export interface TileEntity {
	id: TileId,
	position: TilePosition
	visibility: Visibility
	base: HiddenType<{
		terrainType: TerrainType,
		resourceType: TileResourceType,
		height: number
	}>,
	metaProperties: {
		randomIndex: number,
		worldPosition: Point,
		randomValue0: number,
		randomValue1: number,
		randomValue2: number,
	}
}
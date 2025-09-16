import {Visibility} from "../misc/visibility";
import {HiddenType} from "../../common/hiddenType";
import {TileResourceType} from "./TileResourceType";
import {TileId} from "./tileId";
import {TilePosition} from "./tilePosition";
import {TerrainType} from "./terrainType";
import {Projections} from "../../common/webgl/projections";
import Point = Projections.Point;
import {WorldObjectSummary} from "../worldobject/worldObjectSummary";
import {TileEntity} from "./tileEntity";
import {WorldObject} from "../worldobject/worldObject";

export interface Tile {
	id: TileId,
	position: TilePosition,
	visibility: Visibility
	base: HiddenType<{
		terrainType: TerrainType,
		resourceType: TileResourceType,
		height: number
	}>,
	worldObjects: WorldObjectSummary[],
	metaProperties: {
		worldPosition: Point,
		randomIndex: number,
		randomValue0: number,
		randomValue1: number,
		randomValue2: number,
	}
}

export namespace Tile {

	export function from(tile: TileEntity, worldObjects: WorldObject[]): Tile {
		return {
			id: tile.id,
			position: tile.position,
			visibility: tile.visibility,
			base: tile.base,
			worldObjects: worldObjects,
			metaProperties: tile.metaProperties
		}
	}

}
import {TileSummary} from "../tile/tileSummary";

export interface MovementTarget {
	tile: TileSummary,
	cost: number // how much it costs to move TO this tile/target
}
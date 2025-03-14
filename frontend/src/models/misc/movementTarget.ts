import {TileSummary} from "../tile/tileSummary";

export interface MovementTarget {
	tile: TileSummary,
	cost: number
}
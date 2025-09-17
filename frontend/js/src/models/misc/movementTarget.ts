import {TileSummary} from "../tile/tileSummary";

/**
 * A possible tile for the next movement step.
 */
export interface MovementTarget {
	tile: TileSummary,
	cost: number // how much it costs to move TO this tile/target
}
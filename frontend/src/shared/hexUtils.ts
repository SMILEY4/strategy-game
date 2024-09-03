import {TilePosition} from "../models/primitives/tilePosition";

export namespace HexUtils {

	export function getPositionsRadius(q: number, r: number, radius: number): TilePosition[] {
		const positions: TilePosition[] = [];
		for (let iq = q - radius; iq <= q + radius; iq++) {
			for (let ir = r - radius; ir <= r + radius; ir++) {
				if (HexUtils.distance(q, r, iq, ir) <= radius) {
					positions.push({q: iq, r: ir});
				}
			}
		}
		return positions;
	}

	export function distance(q0: number, r0: number, q1: number, r1: number): number {
		const q = q0 - q1;
		const r = r0 - r1;
		return (Math.abs(q) + Math.abs(r) + Math.abs(-q - r)) / 2;
	}
}
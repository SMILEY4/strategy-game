type HexTilePosition = { q: number, r: number }

type HexChunk = { centerQ: number, centerR: number, tiles: HexTilePosition[] }

export const HexUtils = {

    sCoordinate(q: number, r: number): number {
        return -q - r;
    },

    distance(q0: number, r0: number, q1: number, r1: number): number {
        const q = q0 - q1;
        const r = r0 - r1;
        return (Math.abs(q) + Math.abs(r) + Math.abs(-q - r)) / 2;
    },

    generateTiles(mapRadius: number): HexTilePosition[] {
        const tiles: HexTilePosition[] = [];
        for (let q = -mapRadius; q <= mapRadius; q++) {
            const rMin = Math.max(-mapRadius, -q - mapRadius);
            const rMax = Math.min(mapRadius, -q + mapRadius);
            for (let r = rMin; r <= rMax; r++) {
                tiles.push({q, r});
            }
        }
        return tiles;
    },

	generateChunks(tiles: HexTilePosition[], chunkRadius: number): HexChunk[] {

		// 1. Generate chunk centers that cover the map area.
		// The distance between centers of adjacent hex-chunks is (2 * chunkRadius + 1)
		const step = 2 * chunkRadius + 1;

		// We estimate how far out we need to generate centers based on the map scale.
		// Finding the max coordinate lets us know our search boundaries for centers.
		let maxCoord = 0;
		for (const tile of tiles) {
			maxCoord = Math.max(maxCoord, Math.abs(tile.q), Math.abs(tile.r));
		}

		// Scale the center-generation radius to cover the map's bounds safely
		const centerSearchRadius = Math.ceil(maxCoord / (step * 0.5));
		const chunkCenters: HexTilePosition[] = [];

		for (let q = -centerSearchRadius; q <= centerSearchRadius; q++) {
			for (let r = -centerSearchRadius; r <= centerSearchRadius; r++) {
				// Convert chunk grid coordinates to world hex coordinates
				// This formula handles the interlaced spacing of hex-clusters
				const cq = q * step + r * chunkRadius;
				const cr = r * (chunkRadius + 1) - q * chunkRadius;

				chunkCenters.push({ q: cq, r: cr });
			}
		}

		// 2. Group map tiles by their closest chunk center
		const chunkMap = new Map<string, HexChunk>();

		for (const tile of tiles) {
			let nearestCenter: HexTilePosition | null = null;
			let minDistance = Infinity;

			for (const center of chunkCenters) {
				const dist = this.distance(tile.q, tile.r, center.q, center.r);
				if (dist < minDistance) {
					minDistance = dist;
					nearestCenter = center;
				}
			}

			if (nearestCenter) {
				const key = `${nearestCenter.q},${nearestCenter.r}`;
				if (!chunkMap.has(key)) {
					chunkMap.set(key, {
						centerQ: nearestCenter.q,
						centerR: nearestCenter.r,
						tiles: []
					});
				}
				chunkMap.get(key)!.tiles.push(tile);
			}
		}

		return Array.from(chunkMap.values());
	}

};

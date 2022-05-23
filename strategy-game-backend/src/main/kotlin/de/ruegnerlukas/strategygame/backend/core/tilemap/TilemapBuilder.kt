package de.ruegnerlukas.strategygame.backend.core.tilemap

import de.ruegnerlukas.strategygame.backend.ports.models.game.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.game.Tilemap
import java.util.Random


class TilemapBuilder {

	/**
	 * Creates a new tilemap
	 */
	fun build(): Tilemap {
		val random = Random()
		val tiles = TilemapPositionsBuilder()
			.createHexagon(20)
			.map { Tile(it.q, it.r, random.nextInt(3)) }
		return Tilemap(tiles)
	}

}
package de.ruegnerlukas.strategygame.backend.core.world

import de.ruegnerlukas.strategygame.backend.core.world.tilemap.TilePosition
import de.ruegnerlukas.strategygame.backend.core.world.tilemap.TilemapPositionsBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.world.World
import de.ruegnerlukas.strategygame.backend.shared.WeightedCollection
import kotlin.random.Random

class WorldBuilder {

	private val tileTypes = WeightedCollection<TileType>()
		.add(10.0, TileType.PLAINS)
		.add(2.0, TileType.WATER)
		.add(1.0, TileType.MOUNTAINS)

	fun buildTiles(): List<Tile> {
		val tilePositions = TilemapPositionsBuilder().createHexagon(20)
		return tilePositions.map { buildTileAt(it) }
	}

	fun build(): World {
		return World(
			tiles = buildTiles(),
		)
	}

	private fun buildTileAt(position: TilePosition): Tile {
		return Tile(
			q = position.q,
			r = position.r,
			data = TileData(
				type = tileTypeAt(position)
			),
			entities = listOf()
		)
	}

	private fun tileTypeAt(position: TilePosition): TileType {
		return tileTypes.chooseRandom(Random(position.q + position.r * 1000))
	}

}
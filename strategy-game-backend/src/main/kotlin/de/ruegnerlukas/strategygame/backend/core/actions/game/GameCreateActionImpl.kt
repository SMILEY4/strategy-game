package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TilePositionEntity
import de.ruegnerlukas.strategygame.backend.ports.models.world.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameInsert
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.trackingListOf

class GameCreateActionImpl(
	private val gameInsert: GameInsert,
) : GameCreateAction, Logging {

	override suspend fun perform(worldSettings: WorldSettings): String {
		log().info("Creating new game")
		val game = buildGame()
		val tiles = buildTiles(worldSettings)
		val gameId = save(game, tiles)
		log().info("Created new game with id $gameId")
		return gameId
	}


	/**
	 * Build the game entity
	 */
	private fun buildGame(): GameEntity {
		return GameEntity(
			turn = 0,
			players = mutableListOf()
		)
	}


	/**
	 * Build the tile entities
	 */
	private fun buildTiles(worldSettings: WorldSettings): List<TileEntity> {
		return WorldBuilder().buildTiles(worldSettings).map {
			TileEntity(
				gameId = "",
				position = TilePositionEntity(it.q, it.r),
				data = TileDataEntity(
					terrainType = it.type.name,
				),
				content = trackingListOf()
			)
		}
	}


	/**
	 * Write the given game entity to the database
	 */
	private suspend fun save(game: GameEntity, tiles: List<TileEntity>): String {
		return gameInsert.execute(game, tiles)
	}

}
package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameCreateEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.world.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertGame
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID

class GameCreateActionImpl(
	private val insertGame: InsertGame,
) : GameCreateAction, Logging {

	override suspend fun perform(worldSettings: WorldSettings): String {
		log().info("Creating new game")
		val game = buildGame(worldSettings)
		save(game)
		log().info("Created new game with id ${game.id}")
		return game.id
	}


	/**
	 * Build the game entity
	 */
	private fun buildGame(worldSettings: WorldSettings): GameCreateEntity {
		val gameId = UUID.gen()
		return GameCreateEntity(
			id = gameId,
			turn = 0,
			tiles = WorldBuilder().buildTiles(worldSettings).map {
				TileEntity(
					id = UUID.gen(),
					gameId = gameId,
					q = it.q,
					r = it.r,
					type = it.data.type.name
				)
			}
		)
	}


	/**
	 * Write the given game entity to the database
	 */
	private suspend fun save(game: GameCreateEntity) {
		insertGame.execute(game)
	}

}
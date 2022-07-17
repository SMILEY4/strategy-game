package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameCreateEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldCreateEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertGame
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID
import java.util.Random

class GameCreateActionImpl(
	private val insertGame: InsertGame,
) : GameCreateAction, Logging {

	override suspend fun perform(): String {
		log().info("Creating new game")
		val world = buildWorld()
		val game = buildGame(world)
		save(game)
		log().info("Created new game with id ${game.id}")
		return game.id
	}


	/**
	 * Build the world entity
	 */
	private fun buildWorld(): WorldCreateEntity {
		val worldId = UUID.gen()
		val seed = Random().nextInt()
		return WorldCreateEntity(
			id = worldId,
			tiles = WorldBuilder().buildTiles(seed).map {
				TileEntity(
					id = UUID.gen(),
					worldId = worldId,
					q = it.q,
					r = it.r,
					type = it.data.type.name
				)
			}
		)
	}


	/**
	 * Build the game entity
	 */
	private fun buildGame(world: WorldCreateEntity): GameCreateEntity {
		val gameId = UUID.gen()
		return GameCreateEntity(
			id = gameId,
			turn = 0,
			world = world,
		)
	}


	/**
	 * Write the given game entity to the database
	 */
	private suspend fun save(game: GameCreateEntity) {
		insertGame.execute(game)
	}

}
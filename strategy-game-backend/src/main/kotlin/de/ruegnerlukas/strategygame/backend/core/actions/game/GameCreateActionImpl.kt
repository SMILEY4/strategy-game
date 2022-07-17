package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameCreateEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.gameext.CreateGameInsert
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID
import java.util.Random

class GameCreateActionImpl(
	private val insertExtGame: CreateGameInsert
) : GameCreateAction, Logging {

	override suspend fun perform(): String {
		log().info("Creating new game")
		val game = build()
		save(game)
		log().info("Created new game with id ${game.id}")
		return game.id
	}


	private fun build(): GameCreateEntity {
		val gameId = UUID.gen()
		val seed = Random().nextInt()
		return GameCreateEntity(
			id = gameId,
			seed = seed,
			turn = 0,
			tiles = WorldBuilder().buildTiles(seed).map {
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


	private suspend fun save(game: GameCreateEntity) {
		insertExtGame.execute(game)
			.getOrElse { throw Exception("Could not save ext-game ${game.id}") }
	}

}
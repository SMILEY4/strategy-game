package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.core.tilemap.TilemapBuilder
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.game.Tilemap
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.WorldEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.of
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Either
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.Ok
import de.ruegnerlukas.strategygame.backend.shared.flatMap
import de.ruegnerlukas.strategygame.backend.shared.map
import java.util.UUID

/**
 * Create a new game-lobby
 */
class GameLobbyCreateActionImpl(private val repository: GameRepository): GameLobbyCreateAction, Logging {

	/**
	 * @param userId the id of the user creating the game-lobby
	 */
	override suspend fun perform(userId: String): Either<String, ApplicationError> {
		log().info("Create new game-lobby with owner $userId")
		return Ok(buildGameState(userId))
			.flatMap { repository.save(it) }
			.map { it.gameId }
	}

	private fun buildGameState(userId: String): GameLobbyEntity {
		return GameLobbyEntity(
			gameId = generateGameId(),
			participants = listOf(PlayerEntity.of(userId)),
			world = WorldEntity(
				map = generateMap(),
				markers = listOf()
			),
			commands = listOf()
		)
	}

	private fun generateGameId(): String {
		return UUID.randomUUID()!!.toString()
	}

	private fun generateMap(): Tilemap {
		return TilemapBuilder().build()
	}

}
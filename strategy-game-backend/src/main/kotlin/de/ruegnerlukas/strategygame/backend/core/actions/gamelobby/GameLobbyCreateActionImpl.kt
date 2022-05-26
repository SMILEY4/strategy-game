package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.Game
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.of
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.Ok
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.map
import java.util.UUID

/**
 * Create a new game-lobby
 */
class GameLobbyCreateActionImpl(private val repository: GameRepository) : GameLobbyCreateAction, Logging {

	/**
	 * @param userId the id of the user creating the game-lobby
	 */
	override suspend fun perform(userId: String): Either<String, ApplicationError> {
		log().info("Create new game-lobby with owner $userId")
		return Ok(buildGameState(userId))
			.flatMap { repository.save(it) }
			.map { it.gameId }
	}

	private fun buildGameState(userId: String): Game {
		return Game(
			gameId = generateGameId(),
			participants = listOf(PlayerEntity.of(userId)),
			world = WorldBuilder().build(),
			commands = listOf()
		)
	}

	private fun generateGameId(): String {
		return UUID.randomUUID()!!.toString()
	}

}
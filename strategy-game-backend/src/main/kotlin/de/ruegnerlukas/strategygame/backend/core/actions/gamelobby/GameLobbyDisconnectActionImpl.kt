package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.game.ConnectionState
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlayerConnectionEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Either
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.discardValue
import de.ruegnerlukas.strategygame.backend.shared.flatMap
import de.ruegnerlukas.strategygame.backend.shared.map
import de.ruegnerlukas.strategygame.backend.shared.mapError

class GameLobbyDisconnectActionImpl(private val repository: GameRepository) : GameLobbyDisconnectAction, Logging {

	override suspend fun perform(userId: String): Either<Unit, ApplicationError> {
		log().info("Disconnect user $userId from currently connected game-lobby")
		return repository.getByUserId(userId)
			.map { it.map { curr -> updateGameParticipant(userId, curr) } }
			.flatMap { repository.save(it) }
			.mapError(EntityNotFoundError) {GameNotFoundError}
			.discardValue()
	}

	private fun updateGameParticipant(userId: String, prev: GameLobbyEntity): GameLobbyEntity {
		return GameLobbyEntity(
			gameId = prev.gameId,
			participants = prev.participants.map {
				when (it.userId) {
					userId -> PlayerEntity(
						userId = it.userId,
						connection = PlayerConnectionEntity(
							state = ConnectionState.DISCONNECTED,
							connectionId = -1
						),
						state = it.state
					)
					else -> it
				}
			},
			world = prev.world,
			commands = prev.commands
		)
	}

}
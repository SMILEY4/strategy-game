package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.Game
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlayerConnectionEntity
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.connected
import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyConnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Either
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.discardValue
import de.ruegnerlukas.strategygame.backend.shared.flatMap
import de.ruegnerlukas.strategygame.backend.shared.map
import de.ruegnerlukas.strategygame.backend.shared.mapError

class GameLobbyConnectActionImpl(
	private val repository: GameRepository,
	private val messageProducer: GameMessageProducer
) : GameLobbyConnectAction, Logging {

	override suspend fun perform(userId: String, connectionId: Int, gameId: String): Either<Unit, ApplicationError> {
		log().info("Connect user $userId ($connectionId) to game-lobby $gameId")
		return repository.get(gameId)
			.map { updateGameParticipant(userId, connectionId, it) }
			.flatMap { repository.save(it) }
			.map { sendMessage(connectionId, it) }
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.discardValue()
	}

	private fun updateGameParticipant(userId: String, connectionId: Int, prev: Game): Game {
		return prev.copy(
			participants = prev.participants.map {
				if (it.userId == userId) {
					it.copy(connection = PlayerConnectionEntity.connected(connectionId))
				} else {
					it
				}
			},
		)
	}

	private suspend fun sendMessage(connectionId: Int, game: Game) {
		val message = WorldStateMessage(game.world)
		messageProducer.sendWorldState(connectionId, message)
	}

}
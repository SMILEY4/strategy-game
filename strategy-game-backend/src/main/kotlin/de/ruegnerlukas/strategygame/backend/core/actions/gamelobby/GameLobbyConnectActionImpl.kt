package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.models.new.ConnectionState
import de.ruegnerlukas.strategygame.backend.ports.models.new.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.models.new.PlayerConnectionEntity
import de.ruegnerlukas.strategygame.backend.ports.models.new.PlayerEntity
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

	private fun updateGameParticipant(userId: String, connectionId: Int, prev: GameLobbyEntity): GameLobbyEntity {
		return GameLobbyEntity(
			gameId = prev.gameId,
			participants = prev.participants.map {
				when (it.userId) {
					userId -> PlayerEntity(
						userId = it.userId,
						connection = PlayerConnectionEntity(
							state = ConnectionState.CONNECTED,
							connectionId = connectionId
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

	private suspend fun sendMessage(connectionId: Int, gameLobby: GameLobbyEntity) {
		val message = WorldStateMessage(gameLobby.world)
		messageProducer.sendWorldState(connectionId, message)
	}

}
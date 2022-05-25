package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.models.game.ConnectionState
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlayerState
import de.ruegnerlukas.strategygame.backend.ports.models.game.WorldEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Either
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.discardValue
import de.ruegnerlukas.strategygame.backend.shared.flatMap
import de.ruegnerlukas.strategygame.backend.shared.map
import de.ruegnerlukas.strategygame.backend.shared.mapError

class TurnEndActionImpl(
	private val repository: GameRepository,
	private val messageProducer: GameMessageProducer
) : TurnEndAction, Logging {

	override suspend fun perform(gameId: String): Either<Unit, ApplicationError> {
		log().info("End turn of game $gameId")
		return repository.get(gameId)
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.map { updateState(it) }
			.flatMap { repository.save(it) }
			.map { sendMessage(it) }
			.discardValue()
	}

	private fun updateState(prev: GameLobbyEntity): GameLobbyEntity {
		return GameLobbyEntity(
			gameId = prev.gameId,
			participants = prev.participants.map {
				PlayerEntity(
					userId = it.userId,
					connection = it.connection,
					state = PlayerState.PLAYING
				)
			},
			world = WorldEntity(
				map = prev.world.map,
				markers = prev.world.markers + prev.commands.map { MarkerEntity(it.userId, it.q, it.r) }
			),
			commands = listOf()
		)
	}

	private suspend fun sendMessage(game: GameLobbyEntity) {
		val message = WorldStateMessage(game.world)
		val connectionIds = game.participants
			.filter { it.connection.state == ConnectionState.CONNECTED }
			.map { it.connection.connectionId }
		messageProducer.sendWorldState(connectionIds, message)
	}


}
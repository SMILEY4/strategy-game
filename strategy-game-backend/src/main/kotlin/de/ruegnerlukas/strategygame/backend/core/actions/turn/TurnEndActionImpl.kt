package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.models.new.ConnectionState
import de.ruegnerlukas.strategygame.backend.ports.models.new.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.models.new.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.new.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.new.PlayerState
import de.ruegnerlukas.strategygame.backend.ports.models.new.WorldEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.Rail

class TurnEndActionImpl(
	private val repository: GameRepository,
	private val messageProducer: GameMessageProducer
) : TurnEndAction, Logging {

	override suspend fun perform(gameId: String): Rail<Unit> {
		log().info("End turn of game $gameId")
		return Rail.begin()
			.flatMap("GAME_NOT_FOUND") { repository.get(gameId) }
			.map { updateState(it) }
			.flatMap("FAILED_WRITE") { repository.save(it) }
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
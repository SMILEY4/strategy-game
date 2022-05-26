package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.ConnectionState
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.Game
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlayerState
import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.models.world.MarkerTileEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.map
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

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

	private fun updateState(prev: Game): Game {
		return prev.copy(
			participants = prev.participants.map { it.copy(state = PlayerState.PLAYING) },
			world = prev.world.copy(
				tiles = prev.world.tiles.map { tile ->
					val markerEntities = prev.commands
						.filter { cmd -> cmd.q == tile.q && cmd.r == tile.r }
						.map { MarkerTileEntity(it.userId) }
					tile.copy(entities = tile.entities + markerEntities)
				}
			),
			commands = listOf()
		)
	}

	private suspend fun sendMessage(game: Game) {
		val message = WorldStateMessage(game.world)
		val connectionIds = game.participants
			.filter { it.connection.state == ConnectionState.CONNECTED }
			.map { it.connection.connectionId }
		messageProducer.sendWorldState(connectionIds, message)
	}


}
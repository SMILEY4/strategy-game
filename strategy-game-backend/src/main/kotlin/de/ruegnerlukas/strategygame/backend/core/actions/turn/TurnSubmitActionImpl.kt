package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.getOrElse
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity.Companion.PlaceMarkerOrderData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction.TurnSubmitActionError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.order.OrderInsertMultiple
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByUserAndGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateState
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayersQueryByGameStatePlaying
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TileQueryByGameAndPosition
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID

class TurnSubmitActionImpl(
	private val queryGame: GameQuery,
	private val queryPlayer: PlayerQueryByUserAndGame,
	private val queryPlayerPlaying: PlayersQueryByGameStatePlaying,
	private val queryTile: TileQueryByGameAndPosition,
	private val updatePlayerState: PlayerUpdateState,
	private val insertOrders: OrderInsertMultiple,
	private val endTurnAction: TurnEndAction
) : TurnSubmitAction, Logging {

	override suspend fun perform(userId: String, gameId: String, commands: List<PlaceMarkerCommand>): Either<TurnSubmitActionError, Unit> {
		log().info("user $userId submits ${commands.size} commands for game $gameId")
		return either {
			val player = findPlayer(userId, gameId).bind()
			updateState(player, commands).bind()
			maybeEndTurn(player.gameId).bind()
		}
	}

	private suspend fun findPlayer(userId: String, gameId: String): Either<NotParticipantError, PlayerEntity> {
		return queryPlayer.execute(userId, gameId).mapLeft { NotParticipantError }
	}

	private suspend fun updateState(player: PlayerEntity, commands: List<PlaceMarkerCommand>): Either<TurnSubmitActionError, Unit> {
		return either {
			val game = queryGame.execute(player.gameId).mapLeft { GameNotFoundError }.bind()
			insertOrders.execute(createOrders(game, player, commands))
				.getOrElse { throw Exception("Could not insert orders of player ${player.id}") }
			updatePlayerState.execute(player.id, PlayerEntity.STATE_SUBMITTED)
				.getOrElse { throw Exception("Could not update state of player ${player.id}") }
		}
	}

	private suspend fun createOrders(game: GameEntity, player: PlayerEntity, commands: List<PlaceMarkerCommand>): List<OrderEntity> {
		return commands.map { command -> createOrder(game, player.id, command) }
	}

	private suspend fun createOrder(game: GameEntity, playerId: String, cmd: PlaceMarkerCommand): OrderEntity {
		val tile = queryTile.execute(game.id, cmd.q, cmd.r)
			.getOrElse { throw Exception("Could not find tile at ${cmd.q},${cmd.q} for game ${game.id}") }
		return OrderEntity(
			id = UUID.gen(),
			playerId = playerId,
			turn = game.turn,
			data = Base64.toBase64(Json.asString(PlaceMarkerOrderData(tile.id))),
		)
	}

	private suspend fun maybeEndTurn(gameId: String): Either<TurnSubmitActionError, Unit> {
		val players = queryPlayerPlaying.execute(gameId)
			.getOrElse { throw Exception("Could not get currently playing players for game $gameId") }
		if (players.isEmpty()) {
			return endTurnAction.perform(gameId).mapLeft {
				when (it) {
					is TurnEndAction.GameNotFoundError -> GameNotFoundError
				}
			}
		} else {
			return Unit.right()
		}
	}

}
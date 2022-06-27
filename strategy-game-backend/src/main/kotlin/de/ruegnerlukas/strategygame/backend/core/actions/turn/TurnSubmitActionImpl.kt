package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity.Companion.PlaceMarkerOrderData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
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
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.Ok
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.getOrThrow
import de.ruegnerlukas.strategygame.backend.shared.either.map
import de.ruegnerlukas.strategygame.backend.shared.either.then
import de.ruegnerlukas.strategygame.backend.shared.either.thenOrErr

class TurnSubmitActionImpl(
	private val queryGame: GameQuery,
	private val queryPlayer: PlayerQueryByUserAndGame,
	private val queryPlayerPlaying: PlayersQueryByGameStatePlaying,
	private val queryTile: TileQueryByGameAndPosition,
	private val updatePlayerState: PlayerUpdateState,
	private val insertOrders: OrderInsertMultiple,
	private val endTurnAction: TurnEndAction
) : TurnSubmitAction, Logging {

	override suspend fun perform(userId: String, gameId: String, commands: List<PlaceMarkerCommand>): Either<Unit, ApplicationError> {
		log().info("user $userId submits ${commands.size} commands for game $gameId")
		return Either.start()
			.flatMap { queryPlayer.execute(userId, gameId) }
			.thenOrErr { player -> updateState(player, commands) }
			.thenOrErr { player -> maybeEndTurn(player.gameId) }
			.discardValue()
	}


	private suspend fun updateState(player: PlayerEntity, commands: List<PlaceMarkerCommand>): Either<Unit, ApplicationError> {
		return Either.start()
			.flatMap { queryGame.execute(player.gameId) }
			.thenOrErr { game -> insertOrders.execute(createOrders(game, player, commands)) }
			.thenOrErr { updatePlayerState.execute(player.id, PlayerEntity.STATE_SUBMITTED) }
			.discardValue()
	}

	private suspend fun createOrders(game: GameEntity, player: PlayerEntity, commands: List<PlaceMarkerCommand>): List<OrderEntity> {
		return commands.map { createOrder(game, player.id, it) }.filter { it.isOk() }.map { it.getOrThrow() }
	}

	private suspend fun createOrder(game: GameEntity, playerId: String, cmd: PlaceMarkerCommand): Either<OrderEntity, ApplicationError> {
		return Either.start()
			.flatMap { queryTile.execute(game.id, cmd.q, cmd.r) }
			.map { tile ->
				OrderEntity(
					id = UUID.gen(),
					playerId = playerId,
					turn = game.turn,
					data = Base64.toBase64(Json.asString(PlaceMarkerOrderData(tile.id))),
				)
			}
	}

	private suspend fun maybeEndTurn(gameId: String): Either<Unit, ApplicationError> {
		return Either.start()
			.flatMap { queryPlayerPlaying.execute(gameId) }
			.map { players -> players.isEmpty() }
			.flatMap { allSubmitted ->
				if (allSubmitted) {
					endTurnAction.perform(gameId)
				} else {
					Ok()
				}
			}
	}

}
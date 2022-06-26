package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity.Companion.PlaceMarkerOrderData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameUpdateTurn
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkerInsertMultiple
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.order.OrderQueryByGameAndTurn
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateStateByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayersQueryByGameConnected
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.mapError
import de.ruegnerlukas.strategygame.backend.shared.either.onSuccess
import de.ruegnerlukas.strategygame.backend.shared.either.thenOrErr

class TurnEndActionImpl(
	private val queryGame: GameQuery,
	private val queryOrders: OrderQueryByGameAndTurn,
	private val queryConnectedPlayers: PlayersQueryByGameConnected,
	private val queryTiles: TilesQueryByGame,
	private val updatePlayerState: PlayerUpdateStateByGame,
	private val updateGameTurn: GameUpdateTurn,
	private val insertMarkers: MarkerInsertMultiple,
	private val messageProducer: GameMessageProducer
) : TurnEndAction, Logging {

	override suspend fun perform(gameId: String): Either<Unit, ApplicationError> {
		log().info("End turn of game $gameId")
		return Either.start()
			.flatMap { queryGame.execute(gameId) }
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.thenOrErr { game -> updateState(game) }
			.thenOrErr { game -> sendMessages(game) }
			.discardValue()
	}


	private suspend fun updateState(game: GameEntity): Either<Unit, ApplicationError> {
		return Either.start()
			.flatMap { queryOrders.execute(game.id, game.turn) }
			.thenOrErr { orders -> insertMarkers.execute(orders.map { mapOrderToMarker(it) }) }
			.thenOrErr { updatePlayerState.execute(game.id, PlayerEntity.STATE_PLAYING) }
			.thenOrErr { updateGameTurn.execute(game.id, game.turn + 1) }
			.discardValue()
	}

	private fun mapOrderToMarker(order: OrderEntity): MarkerEntity {
		val data: PlaceMarkerOrderData = Json.fromString(Base64.fromBase64(order.data))
		return MarkerEntity(
			id = UUID.gen(),
			playerId = order.playerId,
			tileId = data.tileId
		)
	}

	private suspend fun sendMessages(game: GameEntity): Either<Unit, ApplicationError> {
		return Either.start()
			.flatMap { queryTiles.execute(game.id) }
			.flatMap { tiles ->
				queryConnectedPlayers.execute(game.id).onSuccess { players ->
					players.filter { it.connectionId != null }.forEach { player ->
						sendMessage(player.connectionId!!, tiles)
					}
				}
			}
			.discardValue()
	}

	private suspend fun sendMessage(connectionId: Int, tiles: List<TileEntity>) {
		val message = WorldStateMessage(tiles.map {
			Tile(
				q = it.q,
				r = it.r,
				data = TileData(TileType.PLAINS),
				entities = emptyList()
			)
		})
		messageProducer.sendWorldState(connectionId, message)
	}

}
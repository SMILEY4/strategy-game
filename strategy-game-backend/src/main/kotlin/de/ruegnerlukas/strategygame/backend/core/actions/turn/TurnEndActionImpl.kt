package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OrderEntity.Companion.PlaceMarkerOrderData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.world.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.TurnEndActionError
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameUpdateTurn
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkerInsertMultiple
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkersQueryByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.order.OrderQueryByGameAndTurn
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateStateByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayersQueryByGameConnected
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID

class TurnEndActionImpl(
	private val queryGame: GameQuery,
	private val queryOrders: OrderQueryByGameAndTurn,
	private val queryConnectedPlayers: PlayersQueryByGameConnected,
	private val queryTiles: TilesQueryByGame,
	private val updatePlayerState: PlayerUpdateStateByGame,
	private val updateGameTurn: GameUpdateTurn,
	private val insertMarkers: MarkerInsertMultiple,
	private val queryMarkers: MarkersQueryByGame,
	private val messageProducer: GameMessageProducer
) : TurnEndAction, Logging {

	override suspend fun perform(gameId: String): Either<TurnEndActionError, Unit> {
		log().info("End turn of game $gameId")
		return either {
			val game = findGame(gameId).bind()
			updateState(game)
			sendMessages(game)
		}
	}

	private suspend fun findGame(gameId: String): Either<TurnEndAction.GameNotFoundError, GameEntity> {
		return queryGame.execute(gameId).mapLeft { TurnEndAction.GameNotFoundError }
	}

	private suspend fun updateState(game: GameEntity) {
		val orders = queryOrders.execute(game.id, game.turn)
			.getOrElse { throw Exception("Could not fetch orders for game ${game.id} in turn ${game.turn}") }
		insertMarkers.execute(orders.map { mapOrderToMarker(it) })
			.getOrElse { throw Exception("Could not insert markers") }
		updatePlayerState.execute(game.id, PlayerEntity.STATE_PLAYING)
			.getOrElse { throw Exception("Could not update state of players in game ${game.id}") }
		updateGameTurn.execute(game.id, game.turn + 1)
			.getOrElse { throw Exception("Could not update turn of game ${game.id}") }
	}

	private fun mapOrderToMarker(order: OrderEntity): MarkerEntity {
		val data: PlaceMarkerOrderData = Json.fromString(Base64.fromBase64(order.data))
		return MarkerEntity(
			id = UUID.gen(),
			playerId = order.playerId,
			tileId = data.tileId
		)
	}

	private suspend fun sendMessages(game: GameEntity) {
			val tiles = queryTiles.execute(game.id)
				.getOrElse { throw Exception("Could not fetch tiles for game ${game.id}") }
			val markers = queryMarkers.execute(game.id)
				.getOrElse { throw Exception("Could not fetch markers for game ${game.id}") }
			val connectedPlayers = queryConnectedPlayers.execute(game.id)
				.getOrElse { throw Exception("Could not fetch connected players for game ${game.id}") }
			connectedPlayers
				.filter { it.connectionId != null }
				.forEach { player ->
					sendMessage(player.connectionId!!, tiles, markers)
				}
	}

	private suspend fun sendMessage(connectionId: Int, tiles: List<TileEntity>, markers: List<MarkerEntity>) {
		val msgTiles = tiles.map { tile ->
			Tile(
				q = tile.q,
				r = tile.r,
				data = TileData(TileType.valueOf(tile.type)),
				entities = markers.filter { it.tileId == tile.id }.map { MarkerTileObject(it.userId!!) }
			)
		}
		messageProducer.sendWorldState(connectionId, msgTiles)
	}

}
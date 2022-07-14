package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.computations.either
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
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

	override suspend fun perform(gameId: String): Either<ApplicationError, Unit> {
		log().info("End turn of game $gameId")
		return either {
			val game = queryGame.execute(gameId).mapLeft { e ->
				when (e) {
					is EntityNotFoundError -> GameNotFoundError
					else -> e
				}
			}.bind()
			updateState(game).bind()
			sendMessages(game).bind()
		}
	}


	private suspend fun updateState(game: GameEntity): Either<ApplicationError, Unit> {
		return either {
			val orders = queryOrders.execute(game.id, game.turn).bind()
			insertMarkers.execute(orders.map { mapOrderToMarker(it) }).bind()
			updatePlayerState.execute(game.id, PlayerEntity.STATE_PLAYING).bind()
			updateGameTurn.execute(game.id, game.turn + 1)
		}
	}

	private fun mapOrderToMarker(order: OrderEntity): MarkerEntity {
		val data: PlaceMarkerOrderData = Json.fromString(Base64.fromBase64(order.data))
		return MarkerEntity(
			id = UUID.gen(),
			playerId = order.playerId,
			tileId = data.tileId
		)
	}

	private suspend fun sendMessages(game: GameEntity): Either<ApplicationError, Unit> {
		return either {
			val tiles = queryTiles.execute(game.id).bind()
			queryConnectedPlayers.execute(game.id).tap { players ->
				queryMarkers.execute(game.id).tap { markers ->
					players.filter { it.connectionId != null }.forEach { player ->
						sendMessage(player.connectionId!!, tiles, markers)
					}
				}
			}
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
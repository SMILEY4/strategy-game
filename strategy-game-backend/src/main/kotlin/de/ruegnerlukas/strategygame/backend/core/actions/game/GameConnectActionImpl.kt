package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.world.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkersQueryByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByUserAndGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateConnection
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameConnectActionImpl(
	private val queryPlayer: PlayerQueryByUserAndGame,
	private val updatePlayerConnection: PlayerUpdateConnection,
	private val queryTiles: TilesQueryByGame,
	private val queryMarkers: MarkersQueryByGame,
	private val messageProducer: GameMessageProducer,
) : GameConnectAction, Logging {

	override suspend fun perform(
		userId: String,
		gameId: String,
		connectionId: Int
	): Either<GameConnectAction.GameConnectActionError, Unit> {
		log().info("Connect user $userId ($connectionId) to game-lobby $gameId")
		return either {
			val player = findValidPlayer(userId, gameId).bind()
			updatePlayerConnection(player, connectionId)
			val tiles = findTiles(gameId)
			sendMessage(connectionId, gameId, tiles)
		}
	}

	private suspend fun findValidPlayer(userId: String, gameId: String): Either<NotParticipantError, PlayerEntity> {
		return queryPlayer.execute(userId, gameId).mapLeft { NotParticipantError }
	}

	private suspend fun updatePlayerConnection(player: PlayerEntity, connectionId: Int) {
		updatePlayerConnection.execute(player.id, connectionId)
			.getOrElse { throw Exception("Could not update player-connection of player ${player.id}") }
	}

	private suspend fun findTiles(gameId: String): List<TileEntity> {
		return queryTiles.execute(gameId)
			.getOrElse { throw Exception("Could not fetch files of game $gameId") }
	}

	private suspend fun sendMessage(connectionId: Int, gameId: String, tiles: List<TileEntity>) {
		queryMarkers.execute(gameId)
			.map { markers ->
				tiles.map { tile ->
					Tile(
						q = tile.q,
						r = tile.r,
						data = TileData(TileType.valueOf(tile.type)),
						entities = markers.filter { it.tileId == tile.id }.map { MarkerTileObject(it.userId!!) }
					)
				}
			}
			.map { extTiles -> messageProducer.sendWorldState(connectionId, extTiles) }
	}

}
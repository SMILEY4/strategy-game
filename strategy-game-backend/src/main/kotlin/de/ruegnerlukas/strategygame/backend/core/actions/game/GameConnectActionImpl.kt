package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.computations.either
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.world.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
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

	override suspend fun perform(userId: String, gameId: String, connectionId: Int): Either<ApplicationError, Unit> {
		log().info("Connect user $userId ($connectionId) to game-lobby $gameId")
		return either {
			val player = queryPlayer.execute(userId, gameId).mapLeft { NotParticipantError }.bind()
			updatePlayerConnection.execute(player.id, connectionId)
			val tiles = queryTiles.execute(gameId).bind()
			sendMessage(connectionId, gameId, tiles)
		}
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
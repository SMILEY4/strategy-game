package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
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
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.map
import de.ruegnerlukas.strategygame.backend.shared.either.mapError
import de.ruegnerlukas.strategygame.backend.shared.either.then
import de.ruegnerlukas.strategygame.backend.shared.either.thenOrErr

class GameConnectActionImpl(
	private val queryPlayer: PlayerQueryByUserAndGame,
	private val updatePlayerConnection: PlayerUpdateConnection,
	private val queryTiles: TilesQueryByGame,
	private val queryMarkers: MarkersQueryByGame,
	private val messageProducer: GameMessageProducer,
) : GameConnectAction, Logging {

	override suspend fun perform(userId: String, gameId: String, connectionId: Int): Either<Unit, ApplicationError> {
		log().info("Connect user $userId ($connectionId) to game-lobby $gameId")
		return Either.start()
			.flatMap { queryPlayer.execute(userId, gameId) }
			.mapError(EntityNotFoundError) { NotParticipantError }
			.thenOrErr { player -> updatePlayerConnection.execute(player.id, connectionId) }
			.flatMap { player -> queryTiles.execute(player.gameId) }
			.map { tiles -> sendMessage(connectionId, gameId, tiles) }
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
			.map { extTiles -> WorldStateMessage(extTiles) }
			.then { msg -> messageProducer.sendWorldState(connectionId, msg) }
	}

}
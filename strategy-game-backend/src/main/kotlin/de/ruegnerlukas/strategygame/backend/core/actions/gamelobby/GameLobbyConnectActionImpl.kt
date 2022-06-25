package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerQueryByUserAndGame
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateConnection
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyConnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.map
import de.ruegnerlukas.strategygame.backend.shared.either.mapError
import de.ruegnerlukas.strategygame.backend.shared.either.thenOrErr

class GameLobbyConnectActionImpl(database: Database, private val messageProducer: GameMessageProducer) : GameLobbyConnectAction, Logging {

	private val queryPlayer = PlayerQueryByUserAndGame(database)
	private val updatePlayerConnection = PlayerUpdateConnection(database)
	private val queryTiles = TilesQueryByGame(database)


	override suspend fun perform(userId: String, gameId: String, connectionId: Int): Either<Unit, ApplicationError> {
		log().info("Connect user $userId ($connectionId) to game-lobby $gameId")
		return Either.start()
			.flatMap { queryPlayer.execute(userId, gameId) }
			.mapError(EntityNotFoundError) { NotParticipantError }
			.thenOrErr { player -> updatePlayerConnection.execute(player.id, connectionId) }
			.flatMap { player -> queryTiles.execute(player.gameId) }
			.map { tiles -> sendMessage(connectionId, tiles) }
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
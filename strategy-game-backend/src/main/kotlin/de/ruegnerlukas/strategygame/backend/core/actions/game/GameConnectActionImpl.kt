package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldEntity
import de.ruegnerlukas.strategygame.backend.ports.models.world.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction.GameConnectActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByUserAndGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateConnection
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.world.WorldQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameConnectActionImpl(
	private val queryPlayer: PlayerQueryByUserAndGame,
	private val updatePlayerConnection: PlayerUpdateConnection,
	private val queryWorld: WorldQuery,
	private val messageProducer: GameMessageProducer,
) : GameConnectAction, Logging {

	override suspend fun perform(userId: String, gameId: String, connectionId: Int): Either<GameConnectActionError, Unit> {
		log().info("Connect user $userId ($connectionId) to game $gameId")
		return either {
			val player = findPlayer(userId, gameId).bind()
			setConnection(player, connectionId)
			val world = getWorld(gameId)
			sendMessage(connectionId, world)
		}
	}


	private suspend fun findPlayer(userId: String, gameId: String): Either<NotParticipantError, PlayerEntity> {
		return queryPlayer.execute(userId, gameId).mapLeft { NotParticipantError }
	}


	private suspend fun setConnection(player: PlayerEntity, connectionId: Int) {
		updatePlayerConnection.execute(player.id, connectionId)
			.getOrElse { throw Exception("Could not update player-connection of player ${player.id}") }
	}


	private suspend fun getWorld(gameId: String): WorldEntity {
		return queryWorld.execute(gameId)
			.getOrElse { throw Exception("Could not fetch world of game $gameId") }
	}


	private suspend fun sendMessage(connectionId: Int, world: WorldEntity) {
		val msgTiles = world.tiles.map { tileEntity ->
			Tile(
				q = tileEntity.q,
				r = tileEntity.r,
				data = TileData(TileType.valueOf(tileEntity.type)),
				entities = world.markers.filter { it.tileId == tileEntity.id }.map { MarkerTileObject(it.userId!!) }
			)
		}
		messageProducer.sendWorldState(connectionId, msgTiles)
	}

}
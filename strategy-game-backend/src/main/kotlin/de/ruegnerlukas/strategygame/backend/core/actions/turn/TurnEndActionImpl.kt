package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.core.CommandResolver
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldEntity
import de.ruegnerlukas.strategygame.backend.ports.models.world.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.TurnEndActionError
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.city.CityInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.command.CommandsQueryByGameAndTurn
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameUpdateTurn
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkerInsertMultiple
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateStateByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.world.WorldQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

class TurnEndActionImpl(
	private val queryGame: GameQuery,
	private val queryCommands: CommandsQueryByGameAndTurn,
	private val updatePlayerState: PlayerUpdateStateByGame,
	private val updateGameTurn: GameUpdateTurn,
	private val insertMarkers: MarkerInsertMultiple,
	private val insertCity: CityInsert,
	private val queryPlayers: PlayerQueryByGame,
	private val queryWorld: WorldQuery,
	private val messageProducer: GameMessageProducer
) : TurnEndAction, Logging {

	override suspend fun perform(gameId: String): Either<TurnEndActionError, Unit> {
		log().info("End turn of game $gameId")
		return either {
			val game = findGame(gameId).bind()
			updateGameState(game)
			updateWorldState(game)
			sendMessages(game)
		}
	}


	private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameEntity> {
		return queryGame.execute(gameId).mapLeft { GameNotFoundError }
	}


	private suspend fun updateGameState(game: GameEntity) {
		updateGameTurn.execute(game.id, game.turn + 1)
			.getOrElse { throw Exception("Could not update turn of game ${game.id}") }
		updatePlayerState.execute(game.id, PlayerEntity.STATE_PLAYING)
			.getOrElse { throw Exception("Could not update state of players in game ${game.id}") }
	}


	private suspend fun updateWorldState(game: GameEntity) {
		val commands = queryCommands.execute(game.id, game.turn)
			.getOrElse { throw Exception("Could not fetch commands for game ${game.id} in turn ${game.turn}") }
		CommandResolver(insertMarkers, insertCity).resolve(commands) // TODO -> inject resolver ?
	}


	private suspend fun sendMessages(game: GameEntity) {
		val world = queryWorld.execute(game.id)
			.getOrElse { throw Exception("Could not fetch world data for game ${game.id}") }
		queryPlayers.execute(game.id)
			.getOrElse { throw Exception("Could not fetch players for game ${game.id}") }
			.filter { it.connectionId != null }
			.forEach { player ->
				sendMessage(player.connectionId!!, world)
			}
	}

	
	private suspend fun sendMessage(connectionId: Int, world: WorldEntity) {
		val msgTiles = world.tiles.map { tile ->
			Tile(
				q = tile.q,
				r = tile.r,
				data = TileData(TileType.valueOf(tile.type)),
				entities = world.markers.filter { it.tileId == tile.id }.map { MarkerTileObject(it.userId!!) }
			)
		}
		messageProducer.sendWorldState(connectionId, msgTiles)
	}

}
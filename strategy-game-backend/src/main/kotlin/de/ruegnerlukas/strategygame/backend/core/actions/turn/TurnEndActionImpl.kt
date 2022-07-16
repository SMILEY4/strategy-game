package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.core.CommandResolver
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.world.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.TurnEndActionError
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.city.CityInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.command.CommandsQueryByGameAndTurn
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameUpdateTurn
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.gameext.ExtGameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkerInsertMultiple
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateStateByGame
import de.ruegnerlukas.strategygame.backend.shared.Logging

class TurnEndActionImpl(
	private val queryGame: GameQuery,
	private val queryCommands: CommandsQueryByGameAndTurn,
	private val updatePlayerState: PlayerUpdateStateByGame,
	private val updateGameTurn: GameUpdateTurn,
	private val insertMarkers: MarkerInsertMultiple,
	private val insertCity: CityInsert,
	private val queryExtGame: ExtGameQuery,
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

	private suspend fun findGame(gameId: String): Either<TurnEndAction.GameNotFoundError, GameEntity> {
		return queryGame.execute(gameId).mapLeft { TurnEndAction.GameNotFoundError }
	}

	private suspend fun updateGameState(game: GameEntity) {
		updatePlayerState.execute(game.id, PlayerEntity.STATE_PLAYING)
			.getOrElse { throw Exception("Could not update state of players in game ${game.id}") }
		updateGameTurn.execute(game.id, game.turn + 1)
			.getOrElse { throw Exception("Could not update turn of game ${game.id}") }
	}

	private suspend fun updateWorldState(game: GameEntity) {
		val commands = queryCommands.execute(game.id, game.turn)
			.getOrElse { throw Exception("Could not fetch commands for game ${game.id} in turn ${game.turn}") }
		CommandResolver(insertMarkers, insertCity).resolve(commands) // TODO -> inject resolver ?
	}

	private suspend fun sendMessages(game: GameEntity) {
		val extGame = queryExtGame
			.execute(
				game.id, ExtGameQuery.Include(
					includeTiles = true,
					includeMarkers = true,
					includePlayers = true
				)
			)
			.getOrElse { throw Exception("Could not fetch ext. game data for game ${game.id}") }
		extGame.players
			.filter { it.connectionId != null }
			.forEach { player ->
				sendMessage(player.connectionId!!, extGame.tiles, extGame.markers)
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
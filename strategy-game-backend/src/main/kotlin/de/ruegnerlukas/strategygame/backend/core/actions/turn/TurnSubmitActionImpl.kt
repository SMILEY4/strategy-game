package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.getOrElse
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlayerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction.TurnSubmitActionError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.command.CommandsInsertMultiple
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByUserAndGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateState
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayersQueryByGameStatePlaying
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TileQueryByGameAndPosition
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID

class TurnSubmitActionImpl(
	private val queryGame: GameQuery,
	private val queryPlayer: PlayerQueryByUserAndGame,
	private val queryPlayerPlaying: PlayersQueryByGameStatePlaying,
	private val queryTile: TileQueryByGameAndPosition,
	private val updatePlayerState: PlayerUpdateState,
	private val insertCommands: CommandsInsertMultiple,
	private val endTurnAction: TurnEndAction
) : TurnSubmitAction, Logging {

	override suspend fun perform(userId: String, gameId: String, commands: List<PlayerCommand>): Either<TurnSubmitActionError, Unit> {
		log().info("user $userId submits ${commands.size} commands for game $gameId")
		return either {
			val player = findPlayer(userId, gameId).bind()
			val game = getGame(gameId)
			updateState(game, player, commands)
			maybeEndTurn(player.gameId).bind()
		}
	}


	private suspend fun findPlayer(userId: String, gameId: String): Either<NotParticipantError, PlayerEntity> {
		return queryPlayer.execute(userId, gameId).mapLeft { NotParticipantError }
	}


	private suspend fun getGame(gameId: String): GameEntity {
		return queryGame.execute(gameId)
			.getOrElse { throw Exception("Could not get game $gameId") }
	}


	private suspend fun updateState(game: GameEntity, player: PlayerEntity, commands: List<PlayerCommand>) {
		updatePlayerState.execute(player.id, PlayerEntity.STATE_SUBMITTED)
			.getOrElse { throw Exception("Could not update state of player ${player.id}") }
		insertCommands.execute(createCommands(game, player, commands))
			.getOrElse { throw Exception("Could not insert commands of player ${player.id}") }
	}


	private suspend fun createCommands(game: GameEntity, player: PlayerEntity, commands: List<PlayerCommand>): List<CommandEntity> {
		return commands.map { command -> createCommand(game, player.id, command) }
	}


	private suspend fun createCommand(game: GameEntity, playerId: String, cmd: PlayerCommand): CommandEntity {
		return when (cmd) {
			is PlaceMarkerCommand -> createCommandPlaceMarker(game, playerId, cmd)
			is CreateCityCommand -> createCommandCreateCity(game, playerId, cmd)
		}
	}


	private suspend fun createCommandPlaceMarker(game: GameEntity, playerId: String, cmd: PlaceMarkerCommand): CommandEntity {
		val tile = queryTile.execute(game.id, cmd.q, cmd.r)
			.getOrElse { throw Exception("Could not find tile at ${cmd.q},${cmd.q} for game ${game.id}") }
		return CommandEntity(
			id = UUID.gen(),
			playerId = playerId,
			turn = game.turn,
			data = Base64.toBase64(Json.asString(PlaceMarkerCommandData(tile.id))),
			type = cmd.type
		)
	}


	private suspend fun createCommandCreateCity(game: GameEntity, playerId: String, cmd: CreateCityCommand): CommandEntity {
		val tile = queryTile.execute(game.id, cmd.q, cmd.r)
			.getOrElse { throw Exception("Could not find tile at ${cmd.q},${cmd.q} for game ${game.id}") }
		return CommandEntity(
			id = UUID.gen(),
			playerId = playerId,
			turn = game.turn,
			data = Base64.toBase64(Json.asString(CreateCityCommandData(tile.id))),
			type = cmd.type
		)
	}


	private suspend fun maybeEndTurn(gameId: String): Either<TurnSubmitActionError, Unit> {
		val players = queryPlayerPlaying.execute(gameId)
			.getOrElse { throw Exception("Could not get currently playing players for game $gameId") }
		if (players.isEmpty()) {
			return endTurnAction.perform(gameId).mapLeft {
				when (it) {
					is TurnEndAction.GameNotFoundError -> throw Exception("Could not find game $gameId when ending turn")
				}
			}
		} else {
			return Unit.right()
		}
	}

}
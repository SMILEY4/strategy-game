package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl.gameId
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.OldPlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlayerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction.TurnSubmitActionError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertCommands
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryPlayer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryPlayersByGameAndState
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdatePlayerState
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID

class TurnSubmitActionImpl(
	private val actionEndTurn: TurnEndAction,
	private val queryPlayer: QueryPlayer,
	private val queryPlayersByGameAndState: QueryPlayersByGameAndState,
	private val queryGame: QueryGame,
	private val updatePlayerState: UpdatePlayerState,
	private val insertCommands: InsertCommands,
) : TurnSubmitAction, Logging {

	override suspend fun perform(userId: String, gameId: String, commands: List<PlayerCommand>): Either<TurnSubmitActionError, Unit> {
		log().info("user $userId submits ${commands.size} commands for game $gameId")
		return either {
			val player = findPlayer(userId, gameId).bind()
			val game = getGame(gameId)
			updatePlayerState(player)
			saveCommands(game, player, commands)
			maybeEndTurn(game)
		}
	}


	/**
	 * Find and return the player or an [NotParticipantError] of the player does not exist
	 */
	private suspend fun findPlayer(userId: String, gameId: String): Either<NotParticipantError, OldPlayerEntity> {
		return queryPlayer.execute(userId, gameId).mapLeft { NotParticipantError }
	}


	/**
	 * Fetch the game with the given id. Since we already found a player, we can assume the game exists
	 */
	private suspend fun getGame(gameId: String): GameEntity {
		return queryGame.execute(gameId)
			.getOrElse { throw Exception("Could not get game $gameId") }
	}


	/**
	 * Set the state of the given player to "submitted"
	 */
	private suspend fun updatePlayerState(player: OldPlayerEntity) {
		updatePlayerState.execute(player.id, OldPlayerEntity.STATE_SUBMITTED)
	}


	/**
	 * save the given commands at the given game
	 */
	private suspend fun saveCommands(game: GameEntity, player: OldPlayerEntity, commands: List<PlayerCommand>) {
		insertCommands.execute(createCommands(game, player, commands))
	}


	/**
	 * create the command-entities from the given [PlayerCommand]s
	 */
	private fun createCommands(game: GameEntity, player: OldPlayerEntity, commands: List<PlayerCommand>): List<CommandEntity> {
		return commands.map { command ->
			when (command) {
				is PlaceMarkerCommand -> createCommandPlaceMarker(game, player, command)
				is CreateCityCommand -> createCommandCreateCity(game, player, command)
			}
		}
	}


	/**
	 * create a command-entity from the given [PlaceMarkerCommand]
	 */
	private fun createCommandPlaceMarker(game: GameEntity, player: OldPlayerEntity, cmd: PlaceMarkerCommand): CommandEntity {
		return CommandEntity(
			id = UUID.gen(),
			playerId = player.id,
			turn = game.turn,
			data = Base64.toBase64(Json.asString(PlaceMarkerCommandData(cmd.q, cmd.r))),
			type = cmd.type
		)
	}


	/**
	 * create a command-entity from the given [CreateCityCommand]
	 */
	private fun createCommandCreateCity(game: GameEntity, player: OldPlayerEntity, cmd: CreateCityCommand): CommandEntity {
		return CommandEntity(
			id = UUID.gen(),
			playerId = player.id,
			turn = game.turn,
			data = Base64.toBase64(Json.asString(CreateCityCommandData(cmd.q, cmd.r))),
			type = cmd.type
		)
	}


	/**
	 * End turn if all players submitted their commands (none in state "playing")
	 */
	private suspend fun maybeEndTurn(game: GameEntity) {
		TODO()
//		val players = queryPlayersByGameAndState.execute(game.id, OldPlayerEntity.STATE_PLAYING)
//		if (players.isEmpty()) {
//			val result = actionEndTurn.perform(game.id)
//			if (result is Either.Left) {
//				when (result.value) {
//					TurnEndAction.GameNotFoundError -> throw Exception("Could not find game $gameId when ending turn")
//					TurnEndAction.CommandResolutionFailedError-> throw Exception("Could not resolve turn for game $gameId")
//				}
//			}
//		}
	}

}
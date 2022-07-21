package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.BroadcastWorldStateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.TurnEndActionError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryCommandsByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdateGameTurn
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdatePlayerStatesByGameId
import de.ruegnerlukas.strategygame.backend.shared.Logging

class TurnEndActionImpl(
	private val actionResolveCommands: ResolveCommandsAction,
	private val actionBroadcastWorldState: BroadcastWorldStateAction,
	private val queryGame: QueryGame,
	private val queryCommandsByGame: QueryCommandsByGame,
	private val updateGameTurn: UpdateGameTurn,
	private val updatePlayerStatesByGameId: UpdatePlayerStatesByGameId,
) : TurnEndAction, Logging {

	override suspend fun perform(gameId: String): Either<TurnEndActionError, Unit> {
		log().info("End turn of game $gameId")
		return either {
			val game = findGame(gameId).bind()
			incrementTurn(game)
			updatePlayerStates(game)
			resolveCommands(game)
			sendGameStateMessages(game)
		}
	}


	/**
	 * Find and return the game or a [GameNotFoundError] if a game with that id does not exist
	 */
	private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameEntity> {
		return queryGame.execute(gameId).mapLeft { GameNotFoundError }
	}


	/**
	 * Increment the turn counter of the given game
	 */
	private suspend fun incrementTurn(game: GameEntity) {
		updateGameTurn.execute(game.id, game.turn + 1)
	}


	/**
	 * set the state of all players to "playing"
	 */
	private suspend fun updatePlayerStates(game: GameEntity) {
		updatePlayerStatesByGameId.execute(game.id, PlayerEntity.STATE_PLAYING)
	}


	/**
	 * Resolve/Apply the commands of the (ended) turn
	 */
	private suspend fun resolveCommands(game: GameEntity) {
		val commands = queryCommandsByGame.execute(game.id, game.turn)
		actionResolveCommands.perform(game.worldId, commands)
	}


	/**
	 * Send the new game-state to the connected players
	 */
	private suspend fun sendGameStateMessages(game: GameEntity) {
		actionBroadcastWorldState.perform(game.id)
			.getOrElse { throw Exception("Could not find game when sending game-state-messages") }
	}

}
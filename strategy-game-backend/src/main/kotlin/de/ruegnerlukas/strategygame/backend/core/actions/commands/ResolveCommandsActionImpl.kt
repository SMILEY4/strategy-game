package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.GameState
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.CommandUnknownError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGameState
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdateGameState
import de.ruegnerlukas.strategygame.backend.shared.Logging

class ResolveCommandsActionImpl(
	private val queryGameState: QueryGameState,
	private val updateGameState: UpdateGameState,
	private val resolvePlaceMarkerCommand: ResolvePlaceMarkerCommand,
	private val resolveCreateCityCommand: ResolveCreateCityCommand,
) : ResolveCommandsAction, Logging {

	override suspend fun perform(
		gameId: String,
		commands: List<CommandEntity>
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		log().info("Resolving ${commands.size} commands for game $gameId")
		return either {
			val state = findGameState(gameId).bind()
			val errors = resolveCommands(state, commands).bind()
			saveGameState(state)
			errors
		}
	}


	/**
	 * Find and return the [GameState] or [GameNotFoundError] if the game does not exist
	 */
	private suspend fun findGameState(gameId: String): Either<GameNotFoundError, GameState> {
		return queryGameState.execute(gameId).mapLeft { GameNotFoundError }
	}


	/**
	 * Apply all given commands to the given world (saved to db)
	 */
	private suspend fun resolveCommands(
		gameState: GameState,
		commands: List<CommandEntity>
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		val errors = mutableListOf<CommandResolutionError>()
		for (command in commands) {
			when (val result = resolveCommand(gameState, command)) {
				is Either.Left -> return result
				is Either.Right -> errors.addAll(result.value)
			}
		}
		return errors.right()
	}


	/**
	 * Apply the given command to the given world (saved to db)
	 */
	private suspend fun resolveCommand(
		gameState: GameState,
		command: CommandEntity
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		return when (command.type) {
			PlaceMarkerCommand.TYPE -> resolvePlaceMarkerCommand.perform(command, gameState)
			CreateCityCommand.TYPE -> resolveCreateCityCommand.perform(command, gameState)
			else -> CommandUnknownError.left()
		}
	}


	/**
	 * Update the game state in the database
	 */
	private suspend fun saveGameState(gameState: GameState) {
		updateGameState.perform(gameState)
	}

}
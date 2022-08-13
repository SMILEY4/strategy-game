package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceMarkerCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.shared.Logging

class ResolveCommandsActionImpl(
	private val resolvePlaceMarkerCommand: ResolvePlaceMarkerCommand,
	private val resolveCreateCityCommand: ResolveCreateCityCommand,
) : ResolveCommandsAction, Logging {

	override suspend fun perform(
		game: GameExtendedEntity,
		commands: List<CommandEntity<*>>
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		log().info("Resolving ${commands.size} commands for game ${game.game.key}")
		return either {
			val errors = resolveCommands(game, commands).bind()
			errors
		}
	}


	/**
	 * Apply all given commands to the given world
	 */
	private suspend fun resolveCommands(
		game: GameExtendedEntity,
		commands: List<CommandEntity<*>>
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		val errors = mutableListOf<CommandResolutionError>()
		for (command in commands) {
			when (val result = resolveCommand(game, command)) {
				is Either.Left -> return result
				is Either.Right -> errors.addAll(result.value)
			}
		}
		return errors.right()
	}


	/**
	 * Apply the given command to the given world
	 */
	private suspend fun resolveCommand(
		game: GameExtendedEntity,
		command: CommandEntity<*>
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		@Suppress("UNCHECKED_CAST")
		return when (command.data) {
			is PlaceMarkerCommandDataEntity -> {
				resolvePlaceMarkerCommand.perform(command as CommandEntity<PlaceMarkerCommandDataEntity>, game)
			}
			is CreateCityCommandDataEntity -> {
				resolveCreateCityCommand.perform(command as CommandEntity<CreateCityCommandDataEntity>, game)
			}
		}
	}

}
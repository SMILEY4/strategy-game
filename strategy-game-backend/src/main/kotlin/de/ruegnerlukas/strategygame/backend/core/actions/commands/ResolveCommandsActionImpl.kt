package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.left
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionResult
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.CommandUnknownError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.WorldNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryWorldExtended
import de.ruegnerlukas.strategygame.backend.shared.Logging

class ResolveCommandsActionImpl(
	private val queryWorldExtended: QueryWorldExtended,
	private val resolvePlaceMarkerCommand: ResolvePlaceMarkerCommand,
	private val resolveCreateCityCommand: ResolveCreateCityCommand
) : ResolveCommandsAction, Logging {

	override suspend fun perform(
		gameId: String,
		worldId: String,
		commands: List<CommandEntity>
	): Either<ResolveCommandsActionError, CommandResolutionResult> {
		log().info("Resolving ${commands.size} commands for game $gameId")
		return either {
			val world = findCompleteWorld(worldId).bind()
			resolveCommands(world, commands)
		}
	}


	/**
	 * Find and return all data about a world or [WorldNotFoundError] if the world does not exist
	 */
	private suspend fun findCompleteWorld(worldId: String): Either<WorldNotFoundError, WorldExtendedEntity> {
		return queryWorldExtended.execute(worldId).mapLeft { WorldNotFoundError }
	}


	/**
	 * Apply all given commands to the given world (saved to db)
	 */
	private suspend fun resolveCommands(world: WorldExtendedEntity, commands: List<CommandEntity>): CommandResolutionResult {
		return CommandResolutionResult.merge(commands.map { command ->
			val result = resolveCommand(world, command)
			when (result) {
				is Either.Left -> {
					log().error("Error during command-resolution: ${result.value}")
					CommandResolutionResult.internalError(command, result.value.toString())
				}
				is Either.Right -> result.value
			}
		})
	}


	/**
	 * Apply the given command to the given world (saved to db)
	 */
	private suspend fun resolveCommand(
		world: WorldExtendedEntity,
		command: CommandEntity
	): Either<ResolveCommandsActionError, CommandResolutionResult> {
		return when (command.type) {
			PlaceMarkerCommand.TYPE -> resolvePlaceMarkerCommand.perform(command, world)
			CreateCityCommand.TYPE -> resolveCreateCityCommand.perform(command, world)
			else -> CommandUnknownError.left()
		}
	}

}
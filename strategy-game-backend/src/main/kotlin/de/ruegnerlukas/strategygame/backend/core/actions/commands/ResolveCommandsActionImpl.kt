package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateTownCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceMarkerCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceScoutCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateTownCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.shared.Logging

class ResolveCommandsActionImpl(
    private val resolvePlaceMarkerCommand: ResolvePlaceMarkerCommand,
    private val resolveCreateCityCommand: ResolveCreateCityCommand,
    private val resolveCreateTownCommand: ResolveCreateTownCommand,
    private val resolvePlaceScoutCommand: ResolvePlaceScoutCommand
) : ResolveCommandsAction, Logging {

    override suspend fun perform(
        game: GameExtendedEntity,
        commands: List<CommandEntity<*>>
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        log().info("Resolving ${commands.size} commands for game ${game.game.key}")
        return either {
            resolveCommands(game, commands).bind()
        }
    }


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
            is CreateTownCommandDataEntity -> {
                resolveCreateTownCommand.perform(command as CommandEntity<CreateTownCommandDataEntity>, game)
            }
            is PlaceScoutCommandDataEntity -> {
                resolvePlaceScoutCommand.perform(command as CommandEntity<PlaceScoutCommandDataEntity>, game)
            }
        }
    }

}
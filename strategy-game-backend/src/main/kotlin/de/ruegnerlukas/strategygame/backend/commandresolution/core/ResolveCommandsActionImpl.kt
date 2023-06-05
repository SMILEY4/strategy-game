package de.ruegnerlukas.strategygame.backend.commandresolution.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.ProductionQueueAddEntryCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolvePlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveProductionQueueAddEntryCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveProductionQueueRemoveEntryCommand
import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction

class ResolveCommandsActionImpl(
    private val resolvePlaceMarkerCommand: ResolvePlaceMarkerCommand,
    private val resolveCreateCityCommand: ResolveCreateCityCommand,
    private val resolvePlaceScoutCommand: ResolvePlaceScoutCommand,
    private val resolveAddProductionQueueEntryCommand: ResolveProductionQueueAddEntryCommand,
    private val resolveRemoveProductionQueueEntryCommand: ResolveProductionQueueRemoveEntryCommand
) : ResolveCommandsAction, Logging {

    private val metricId = metricCoreAction(ResolveCommandsAction::class)

    override suspend fun perform(
        game: GameExtended,
        commands: List<Command<*>>
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        return Monitoring.coTime(metricId) {
            log().info("Resolving ${commands.size} commands for game ${game.game.gameId}")
            either {
                resolveCommands(game, commands).bind()
            }
        }
    }


    private suspend fun resolveCommands(
        game: GameExtended,
        commands: List<Command<*>>
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
        game: GameExtended,
        command: Command<*>
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        @Suppress("UNCHECKED_CAST")
        return when (command.data) {
            is PlaceMarkerCommandData -> {
                resolvePlaceMarkerCommand.perform(command as Command<PlaceMarkerCommandData>, game)
            }
            is CreateCityCommandData -> {
                resolveCreateCityCommand.perform(command as Command<CreateCityCommandData>, game)
            }
            is PlaceScoutCommandData -> {
                resolvePlaceScoutCommand.perform(command as Command<PlaceScoutCommandData>, game)
            }
            is ProductionQueueAddEntryCommandData -> {
                resolveAddProductionQueueEntryCommand.perform(command as Command<ProductionQueueAddEntryCommandData>, game)
            }
            is ProductionQueueRemoveEntryCommandData -> {
                resolveRemoveProductionQueueEntryCommand.perform(command as Command<ProductionQueueRemoveEntryCommandData>, game)
            }
        }
    }

}
package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.RemoveProductionQueueEntryValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveProductionQueueRemoveEntryCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.update.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.validation.ValidationContext
import de.ruegnerlukas.strategygame.backend.shared.validation.validations

class ResolveProductionQueueRemoveEntryCommandImpl(
    private val turnUpdate: TurnUpdateAction,
) : ResolveProductionQueueRemoveEntryCommand, Logging {

    private val metricId = MonitoringService.metricCoreAction(ResolveProductionQueueRemoveEntryCommandImpl::class)

    override suspend fun perform(
        command: Command<ProductionQueueRemoveEntryCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsAction.ResolveCommandsActionError, List<CommandResolutionError>> {
        return Monitoring.coTime(metricId) {
            log().info("Resolving '${command.data.displayName()}'-command for game ${game.game.gameId} and country ${command.countryId}")
            either {
                val city = findCity(command.data.cityId, game).bind()
                validateCommand(command.countryId, city, command.data.queueEntryId).ifInvalid<Unit> { reasons ->
                    return@either reasons.map { CommandResolutionError(command, it) }
                }
                turnUpdate.commandProductionQueueRemove(game, command)
                emptyList()
            }
        }
    }

    private fun findCity(cityId: String, state: GameExtended): Either<ResolveCommandsAction.ResolveCommandsActionError, City> {
        val city = state.cities.find { it.cityId == cityId }
        if (city == null) {
            return ResolveCommandsAction.CityNotFoundError.left()
        } else {
            return city.right()
        }
    }


}

private object RemoveProductionQueueEntryValidations {

    fun validateCommand(countryId: String, city: City, queueEntryId: String): ValidationContext {
        return validations(false) {
            validCityOwner(city, countryId)
            validEntryId(city, queueEntryId)
        }
    }

    fun ValidationContext.validCityOwner(city: City, countryId: String) {
        validate("REMOVE_PRODUCTION_QUEUE_ENTRY.CITY_OWNER") {
            city.countryId == countryId
        }
    }

    fun ValidationContext.validEntryId(city: City, queueEntryId: String) {
        validate("REMOVE_PRODUCTION_QUEUE_ENTRY.ENTRY_ID") {
            city.productionQueue.filter { it.entryId == queueEntryId }.size == 1
        }
    }

}
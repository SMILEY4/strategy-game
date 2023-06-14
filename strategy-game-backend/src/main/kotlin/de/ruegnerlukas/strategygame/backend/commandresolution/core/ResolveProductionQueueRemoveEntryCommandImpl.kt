package de.ruegnerlukas.strategygame.backend.commandresolution.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.commandresolution.core.RemoveProductionQueueEntryValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveProductionQueueRemoveEntryCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.required.RemoveProductionQueueEntryAction
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService
import de.ruegnerlukas.strategygame.backend.common.utils.ValidationContext
import de.ruegnerlukas.strategygame.backend.common.utils.validations

class ResolveProductionQueueRemoveEntryCommandImpl(
    private val removeProductionQueueEntryAction: RemoveProductionQueueEntryAction,
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
                removeProductionQueueEntryAction.perform(game, command)
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
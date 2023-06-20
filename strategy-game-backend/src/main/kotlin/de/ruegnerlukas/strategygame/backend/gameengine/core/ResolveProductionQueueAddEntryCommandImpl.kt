package de.ruegnerlukas.strategygame.backend.gameengine.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.AddProductionQueueEntryAction
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService
import de.ruegnerlukas.strategygame.backend.common.utils.ValidationContext
import de.ruegnerlukas.strategygame.backend.common.utils.validations
import de.ruegnerlukas.strategygame.backend.gameengine.core.AddProductionQueueEntryValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueAddEntryCommandData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.ResolveProductionQueueAddEntryCommand

class ResolveProductionQueueAddEntryCommandImpl(
    private val addProductionQueueEntryAction: AddProductionQueueEntryAction,
    private val gameConfig: GameConfig
) : ResolveProductionQueueAddEntryCommand, Logging {

    private val metricId = MonitoringService.metricCoreAction(ResolveProductionQueueAddEntryCommandImpl::class)

    override suspend fun perform(
        command: Command<ProductionQueueAddEntryCommandData>,
        game: GameExtended,
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        return Monitoring.coTime(metricId) {
            log().info("Resolving '${command.data.displayName()}'-command for game ${game.game.gameId} and country ${command.countryId}")
            either {
                val city = findCity(command.data.cityId, game).bind()
                validateCommand(command.countryId, city, gameConfig).ifInvalid<Unit> { reasons ->
                    return@either reasons.map { CommandResolutionError(command, it) }
                }
                addProductionQueueEntryAction.performAddProductionQueueEntry(game, command)
                emptyList()
            }
        }
    }

    private fun findCity(cityId: String, state: GameExtended): Either<ResolveCommandsActionError, City> {
        val city = state.cities.find { it.cityId == cityId }
        if (city == null) {
            return ResolveCommandsAction.CityNotFoundError.left()
        } else {
            return city.right()
        }
    }

}

private object AddProductionQueueEntryValidations {

    fun validateCommand(countryId: String, city: City, gameConfig: GameConfig): ValidationContext {
        return validations(false) {
            validCityOwner(city, countryId)
            validCitySpace(gameConfig, city)
        }
    }

    fun ValidationContext.validCityOwner(city: City, countryId: String) {
        validate("ADD_PRODUCTION_QUEUE_ENTRY.CITY_OWNER") {
            city.countryId == countryId
        }
    }

    fun ValidationContext.validCitySpace(gameConfig: GameConfig, city: City) {
        validate("ADD_PRODUCTION_QUEUE_ENTRY.BUILDING.CITY_SPACE") {
            if (city.isProvinceCapital) {
                (gameConfig.cityBuildingSlots - city.buildings.size) > 0
            } else {
                (gameConfig.townBuildingSlots - city.buildings.size) > 0
            }
        }
    }

}
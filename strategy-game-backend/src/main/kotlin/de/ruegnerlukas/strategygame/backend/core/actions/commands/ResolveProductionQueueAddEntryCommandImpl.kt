package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.AddProductionQueueEntryValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueAddEntryCommandData
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveProductionQueueAddEntryCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.update.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.validation.ValidationContext
import de.ruegnerlukas.strategygame.backend.shared.validation.validations

class ResolveProductionQueueAddEntryCommandImpl(
    private val turnUpdate: TurnUpdateAction,
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
                turnUpdate.commandProductionQueueAdd(game, command)
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
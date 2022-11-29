package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.CreateBuildingValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventManager
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandBuildingCreate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateBuildingCommand
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.validation.ValidationContext
import de.ruegnerlukas.strategygame.backend.shared.validation.validations

class ResolveCreateBuildingCommandImpl(
    private val gameConfig: GameConfig,
    private val gameEventManager: GameEventManager
) : ResolveCreateBuildingCommand, Logging {

    private val metricId = metricCoreAction(ResolveCreateBuildingCommand::class)

    override suspend fun perform(
        command: Command<CreateBuildingCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsAction.ResolveCommandsActionError, List<CommandResolutionError>> {
        return Monitoring.coTime(metricId) {
            log().info("Resolving '${command.data.displayName()}'-command for game ${game.game.gameId} and country ${command.countryId}")
            either {
                val city = findCity(command.data.cityId, game).bind()
                val country = findCountry(city.countryId, game).bind()
                validateCommand(command.countryId, city, country, gameConfig).ifInvalid<Unit> { reasons ->
                    return@either reasons.map { CommandResolutionError(command, it) }
                }
                gameEventManager.send(GameEventCommandBuildingCreate::class.simpleName!!, GameEventCommandBuildingCreate(game, command))
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


    private fun findCountry(
        countryId: String,
        state: GameExtended
    ): Either<ResolveCommandsAction.ResolveCommandsActionError, Country> {
        val country = state.countries.find { it.countryId == countryId }
        if (country == null) {
            return ResolveCommandsAction.CountryNotFoundError.left()
        } else {
            return country.right()
        }
    }

}


private object CreateBuildingValidations {

    fun validateCommand(
        countryId: String,
        city: City,
        country: Country,
        gameConfig: GameConfig
    ): ValidationContext {
        return validations(false) {
            validCityOwner(city, countryId)
            validCitySpace(gameConfig, city)
            validResources(gameConfig, country)
        }
    }

    fun ValidationContext.validCityOwner(city: City, countryId: String) {
        validate("BUILDING.CITY_OWNER") {
            city.countryId == countryId
        }
    }

    fun ValidationContext.validCitySpace(gameConfig: GameConfig, city: City) {
        validate("BUILDING.CITY_SPACE") {
            if (city.isProvinceCapital) {
                (gameConfig.cityBuildingSlots - city.buildings.size) > 0
            } else {
                (gameConfig.townBuildingSlots - city.buildings.size) > 0
            }
        }
    }

    fun ValidationContext.validResources(gameConfig: GameConfig, country: Country) {
        validate("BUILDING.RESOURCES") {
            country.resources.wood >= gameConfig.buildingCostWood
            country.resources.stone >= gameConfig.buildingCostStone
        }
    }

}
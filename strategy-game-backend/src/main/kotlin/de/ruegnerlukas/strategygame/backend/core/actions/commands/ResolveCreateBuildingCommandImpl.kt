package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.CreateBuildingValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateBuildingCommand
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle
import de.ruegnerlukas.strategygame.backend.shared.validation.ValidationContext
import de.ruegnerlukas.strategygame.backend.shared.validation.validations

class ResolveCreateBuildingCommandImpl(
    private val gameConfig: GameConfig
) : ResolveCreateBuildingCommand, Logging {

    override suspend fun perform(
        command: Command<CreateBuildingCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsAction.ResolveCommandsActionError, List<CommandResolutionError>> {
        log().info("Resolving '${command.data.displayName()}'-command for game ${game.game.gameId} and country ${command.countryId}")
        return either {
            val city = findCity(command.data.cityId, game).bind()
            val country = findCountry(city.countryId, game).bind()
            validateCommand(command.countryId, city, country, gameConfig).ifInvalid<Unit> { reasons ->
                return@either reasons.map { CommandResolutionError(command, it) }
            }
            createBuilding(game, city, command.data.buildingType)
            updateCountryResources(country)
            emptyList()
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


    private fun createBuilding(game: GameExtended, city: City, buildingType: BuildingType) {
        city.buildings.add(
            Building(
                type = buildingType,
                tile = decideTargetTile(game, city, buildingType)
            )
        )
    }


    private fun decideTargetTile(game: GameExtended, city: City, buildingType: BuildingType): TileRef? {
        return positionsCircle(city.tile, 1)
            .asSequence()
            .filter { it.q != city.tile.q && it.r != city.tile.r }
            .mapNotNull { pos -> game.tiles.find { it.position.q == pos.q && it.position.r == pos.r } }
            .filter { tile -> city.buildings.none { tile.tileId == it.tile?.tileId } }
            .filter {
                when (buildingType) {
                    BuildingType.LUMBER_CAMP -> it.data.resourceType == TileResourceType.FOREST.name
                    BuildingType.MINE -> it.data.resourceType == TileResourceType.METAL.name
                    BuildingType.QUARRY -> it.data.resourceType == TileResourceType.STONE.name
                    BuildingType.HARBOR -> it.data.resourceType == TileResourceType.FISH.name
                    BuildingType.FARM -> it.data.terrainType == TileType.LAND.name
                }
            }
            .toList()
            .randomOrNull()
            ?.let { TileRef(it.tileId, it.position.q, it.position.r) }
    }


    private fun updateCountryResources(country: Country) {
        country.resources.wood -= gameConfig.buildingCostWood
        country.resources.stone -= gameConfig.buildingCostStone
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
            if (city.isCity) {
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
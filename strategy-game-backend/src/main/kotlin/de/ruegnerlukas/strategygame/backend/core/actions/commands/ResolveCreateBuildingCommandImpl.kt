package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.CreateBuildingValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.entities.Building
import de.ruegnerlukas.strategygame.backend.ports.models.entities.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateBuildingCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
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
        command: CommandEntity<CreateBuildingCommandDataEntity>,
        game: GameExtendedEntity
    ): Either<ResolveCommandsAction.ResolveCommandsActionError, List<CommandResolutionError>> {
        log().info("Resolving '${command.data.type}'-command for game ${game.game.key} and country ${command.countryId}")
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


    private fun findCity(cityId: String, state: GameExtendedEntity): Either<ResolveCommandsAction.ResolveCommandsActionError, CityEntity> {
        val city = state.cities.find { it.getKeyOrThrow() == cityId }
        if (city == null) {
            return ResolveCommandsAction.CityNotFoundError.left()
        } else {
            return city.right()
        }
    }


    private fun findCountry(
        countryId: String,
        state: GameExtendedEntity
    ): Either<ResolveCommandsAction.ResolveCommandsActionError, CountryEntity> {
        val country = state.countries.find { it.key == countryId }
        if (country == null) {
            return ResolveCommandsAction.CountryNotFoundError.left()
        } else {
            return country.right()
        }
    }


    private fun createBuilding(game: GameExtendedEntity, city: CityEntity, buildingType: BuildingType) {
        city.buildings.add(
            Building(
                type = buildingType,
                tile = decideTargetTile(game, city, buildingType)
            )
        )
    }


    private fun decideTargetTile(game: GameExtendedEntity, city: CityEntity, buildingType: BuildingType): TileRef? {
        return positionsCircle(city.tile, 1)
            .asSequence()
            .filter { it.q != city.tile.q && it.r != city.tile.r }
            .mapNotNull { pos -> game.tiles.find { it.position.q == pos.q && it.position.r == pos.r } }
            .filter { tile -> city.buildings.none { tile.getKeyOrThrow() == it.tile?.tileId } }
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
            ?.let { TileRef(it.getKeyOrThrow(), it.position.q, it.position.r) }
    }


    private fun updateCountryResources(country: CountryEntity) {
        country.resources.wood -= gameConfig.buildingCostWood
        country.resources.stone -= gameConfig.buildingCostStone
    }

}


private object CreateBuildingValidations {

    fun validateCommand(
        countryId: String,
        city: CityEntity,
        country: CountryEntity,
        gameConfig: GameConfig
    ): ValidationContext {
        return validations(false) {
            validCityOwner(city, countryId)
            validCitySpace(gameConfig, city)
            validResources(gameConfig, country)
        }
    }

    fun ValidationContext.validCityOwner(city: CityEntity, countryId: String) {
        validate("BUILDING.CITY_OWNER") {
            city.countryId == countryId
        }
    }

    fun ValidationContext.validCitySpace(gameConfig: GameConfig, city: CityEntity) {
        validate("BUILDING.CITY_SPACE") {
            if (city.city) {
                (gameConfig.cityBuildingSlots - city.buildings.size) > 0
            } else {
                (gameConfig.townBuildingSlots - city.buildings.size) > 0
            }
        }
    }

    fun ValidationContext.validResources(gameConfig: GameConfig, country: CountryEntity) {
        validate("BUILDING.RESOURCES") {
            country.resources.wood >= gameConfig.buildingCostWood
            country.resources.stone >= gameConfig.buildingCostStone
        }
    }

}
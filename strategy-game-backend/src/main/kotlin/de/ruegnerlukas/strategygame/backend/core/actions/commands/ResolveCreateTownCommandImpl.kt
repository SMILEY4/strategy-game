package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateTownCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateTownCommand
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.max

class ResolveCreateTownCommandImpl(
    private val reservationInsert: ReservationInsert,
    private val gameConfig: GameConfig,
) : ResolveCreateTownCommand, Logging {

    override suspend fun perform(
        command: CommandEntity<CreateTownCommandDataEntity>,
        game: GameExtendedEntity
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        log().info("Resolving 'create-town'-command for game ${game.game.key} and country ${command.countryId}")
        return either {
            val country = findCountry(command.countryId, game).bind()
            val targetTile = findTile(command.data.q, command.data.r, game).bind()
            val validationErrors = validateCommand(command, game, country, targetTile)
            if (validationErrors.isEmpty()) {
                createTown(game, country.getKeyOrThrow(), command.data.parentCity, targetTile, command.data.name)
                updateCountryResources(country)
                emptyList()
            } else {
                validationErrors.map { CommandResolutionError(command, it) }
            }
        }
    }


    private fun findCountry(countryId: String, state: GameExtendedEntity): Either<ResolveCommandsActionError, CountryEntity> {
        val country = state.countries.find { it.key == countryId }
        if (country == null) {
            return ResolveCommandsAction.CountryNotFoundError.left()
        } else {
            return country.right()
        }
    }


    private fun findTile(q: Int, r: Int, state: GameExtendedEntity): Either<ResolveCommandsActionError, TileEntity> {
        val targetTile = state.tiles.find { it.position.q == q && it.position.r == r }
        if (targetTile == null) {
            return ResolveCommandsAction.TileNotFoundError.left()
        } else {
            return targetTile.right()
        }
    }


    private fun validateCommand(
        command: CommandEntity<CreateTownCommandDataEntity>,
        game: GameExtendedEntity,
        country: CountryEntity,
        targetTile: TileEntity,
    ): List<String> {
        return mutableListOf<String>().apply {
            addAll(validateParentCity(command.data.parentCity, game.cities))
            addAll(validateName(command.data.name))
            addAll(validateTileType(targetTile))
            addAll(validateTileCity(targetTile, game.cities))
            addAll(validateResourceCost(country))
            addAll(validateTileOwner(country, targetTile))
            addAll(validateTileInfluence(country, targetTile))
        }
    }


    private fun validateParentCity(cityId: String, cities: List<CityEntity>): List<String> {
        val parent = cities.find { it.getKeyOrThrow() == cityId }
        if (parent == null) {
            return listOf("parent unknown")
        }
        if (!parent.city) {
            return listOf("invalid parent")
        }
        return emptyList()
    }


    private fun validateName(name: String): List<String> {
        if (name.isNotBlank()) {
            return emptyList()
        } else {
            return listOf("invalid name")
        }
    }


    private fun validateTileType(tile: TileEntity): List<String> {
        if (tile.data.terrainType == TileType.LAND.name) {
            return emptyList()
        } else {
            return listOf("invalid tile type")
        }
    }


    private fun validateTileOwner(country: CountryEntity, target: TileEntity): List<String> {
        if (target.owner != null && target.owner!!.countryId != country.key) {
            return listOf("tile is part of another country")
        } else {
            return emptyList()
        }
    }


    private fun validateTileInfluence(country: CountryEntity, target: TileEntity): List<String> {
        // country owns tile
        if (target.owner != null && target.owner!!.countryId == country.key) {
            return emptyList()
        }
        // nobody else has more than 'MAX_TILE_INFLUENCE' influence
        val maxForeignInfluence = target.influences.filter { it.countryId != country.key }.map { it.totalValue }.max { it } ?: 0.0
        if (maxForeignInfluence < gameConfig.cityTileMaxForeignInfluence) {
            return emptyList()
        }
        // country has the most influence on tile
        val countryInfluence = target.influences.find { it.countryId == country.key }?.totalValue ?: 0.0
        if (countryInfluence >= maxForeignInfluence) {
            return emptyList()
        }
        return listOf("not enough influence over tile")
    }


    private fun validateTileCity(target: TileEntity, cities: List<CityEntity>): List<String> {
        val city = cities.find { it.tile.tileId == target.key }
        if (city != null) {
            return listOf("tile already occupied")
        } else {
            return emptyList()
        }
    }


    private fun validateResourceCost(country: CountryEntity): List<String> {
        if (country.resources.money < gameConfig.townCost) {
            return listOf("not enough money")
        } else {
            return emptyList()
        }
    }


    private suspend fun createTown(game: GameExtendedEntity, countryId: String, parentCity: String, tile: TileEntity, name: String) {
        CityEntity(
            gameId = tile.gameId,
            countryId = countryId,
            tile = TileRef(tile.key!!, tile.position.q, tile.position.r),
            name = name,
            color = RGBColor.random(),
            city = false,
            parentCity = parentCity,
            key = reservationInsert.reserveCity()
        ).also { game.cities.add(it) }
    }


    private fun updateCountryResources(country: CountryEntity) {
        country.resources.money -= gameConfig.townCost
    }

}
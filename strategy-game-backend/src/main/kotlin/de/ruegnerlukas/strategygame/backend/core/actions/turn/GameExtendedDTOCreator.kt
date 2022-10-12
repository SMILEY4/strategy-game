package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.BuildingDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CityDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTODataTier1
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTODataTier3
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTOResources
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.MarkerTileDTOContent
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.ScoutTileDTOContent
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTODataTier0
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTODataTier1
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTODataTier2
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOOwner
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOVisibility
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

class GameExtendedDTOCreator(
    private val gameConfig: GameConfig
) {

    private val unknownCountryId = "?"
    private val unknownCityId = "?"

    fun create(userId: String, game: GameExtendedEntity): GameExtendedDTO {
        val playerCountry = game.countries.first { it.userId == userId }
        val knownCountryIds = getKnownCountryIds(playerCountry.getKeyOrThrow(), game.tiles).toSet()

        val tileDTOs: List<TileDTO> = game.tiles
            .map { tileEntity -> buildTile(playerCountry.getKeyOrThrow(), tileEntity, knownCountryIds, game.tiles) }

        val countryDTOs = knownCountryIds
            .map { countryId -> game.countries.first { it.key == countryId } }
            .map { country -> buildCountry(playerCountry.getKeyOrThrow(), country) }

        val cityDTOs = game.cities
            .filter { city -> tileDTOs.first { it.dataTier0.tileId == city.tile.tileId }.dataTier0.visibility != TileDTOVisibility.UNKNOWN }
            .map { buildCity(it) }

        return GameExtendedDTO(
            turn = game.game.turn,
            tiles = tileDTOs,
            countries = countryDTOs,
            cities = cityDTOs,
        )
    }


    private fun getKnownCountryIds(countryId: String, tiles: List<TileEntity>): List<String> {
        return (tiles
            .filter { calculateTileVisibility(countryId, it, tiles) != TileDTOVisibility.UNKNOWN }
            .mapNotNull { tile -> tile.owner?.countryId }
                + countryId)
            .distinct()
    }


    private fun calculateTileVisibility(countryId: String, tile: TileEntity, tiles: List<TileEntity>): TileDTOVisibility {
        if (tile.discoveredByCountries.contains(countryId)) {

            val scoutNearby = positionsCircle(tile.position, gameConfig.scoutVisibilityRange)
                .asSequence()
                .mapNotNull { pos -> tiles.find { it.position.q == pos.q && it.position.r == pos.r } }
                .mapNotNull { t -> t.content.find { it.type == ScoutTileContent.TYPE }?.let { it as ScoutTileContent } }
                .any { it.countryId == countryId }
            if (scoutNearby) {
                return TileDTOVisibility.VISIBLE
            }

            val hasInfluence = tile.influences.any { it.countryId == countryId }
            val foreignOwner = tile.owner != null && tile.owner?.countryId != countryId
            if (hasInfluence && !foreignOwner) {
                return TileDTOVisibility.VISIBLE
            } else {
                return TileDTOVisibility.DISCOVERED
            }

        } else {
            return TileDTOVisibility.UNKNOWN
        }
    }


    private fun buildTile(countryId: String, tileEntity: TileEntity, knownCountries: Set<String>, tiles: List<TileEntity>): TileDTO {
        val baseData = buildTileDataTier0(countryId, tileEntity, tiles)
        var generalData: TileDTODataTier1? = null
        var advancedData: TileDTODataTier2? = null
        if (baseData.visibility == TileDTOVisibility.DISCOVERED || baseData.visibility == TileDTOVisibility.VISIBLE) {
            generalData = buildTileDataTier1(tileEntity)
        }
        if (baseData.visibility == TileDTOVisibility.VISIBLE) {
            advancedData = buildTileDataTier2(countryId, tileEntity, knownCountries)
        }
        return TileDTO(
            dataTier0 = baseData,
            dataTier1 = generalData,
            dataTier2 = advancedData
        )
    }

    private fun buildTileDataTier0(countryId: String, tileEntity: TileEntity, tiles: List<TileEntity>): TileDTODataTier0 {
        return TileDTODataTier0(
            tileId = tileEntity.getKeyOrThrow(),
            position = tileEntity.position,
            visibility = calculateTileVisibility(countryId, tileEntity, tiles)
        )
    }

    private fun buildTileDataTier1(tileEntity: TileEntity): TileDTODataTier1 {
        return TileDTODataTier1(
            terrainType = tileEntity.data.terrainType,
            resourceType = tileEntity.data.resourceType,
            owner = tileEntity.owner?.let { TileDTOOwner(it.countryId, it.cityId) }
        )
    }

    private fun buildTileDataTier2(countryId: String, tileEntity: TileEntity, knownCountries: Set<String>): TileDTODataTier2 {
        return TileDTODataTier2(
            influences = buildTileInfluences(countryId, tileEntity, knownCountries),
            content = tileEntity.content.map {
                when (it) {
                    is MarkerTileContent -> MarkerTileDTOContent(it.countryId)
                    is ScoutTileContent -> ScoutTileDTOContent(it.countryId, it.turn)
                }
            }
        )
    }

    private fun buildTileInfluences(countryId: String, tileEntity: TileEntity, knownCountries: Set<String>): List<TileDTOInfluence> {
        val influences = mutableListOf<TileDTOInfluence>()
        influences.addAll( // player country
            tileEntity.influences
                .filter { influence -> influence.countryId == countryId }
                .map { influence ->
                    TileDTOInfluence(
                        countryId = influence.countryId,
                        cityId = influence.cityId,
                        amount = influence.amount
                    )
                }
        )
        influences.addAll( // foreign known countries
            tileEntity.influences
                .filter { influence -> influence.countryId != countryId && knownCountries.contains(influence.countryId) }
                .map { influence ->
                    TileDTOInfluence(
                        countryId = influence.countryId,
                        cityId = influence.cityId,
                        amount = influence.amount
                    )
                }
        )
        TileDTOInfluence(
            countryId = unknownCountryId,
            cityId = unknownCityId,
            amount = tileEntity.influences
                .filter { influence -> !knownCountries.contains(influence.countryId) }
                .sumOf { influence -> influence.amount },
        ).let {
            if (it.amount > 0) {
                influences.add(it)
            }
        }
        return influences
    }


    private fun buildCountry(playerCountryId: String, countryEntity: CountryEntity): CountryDTO {
        val dataTier1 = CountryDTODataTier1(
            countryId = countryEntity.getKeyOrThrow(),
            userId = countryEntity.userId,
            color = countryEntity.color
        )
        var dataTier3: CountryDTODataTier3? = null
        if (playerCountryId == countryEntity.key) {
            dataTier3 = CountryDTODataTier3(
                resources = CountryDTOResources(
                    money = countryEntity.resources.money,
                    wood = countryEntity.resources.wood,
                    food = countryEntity.resources.food,
                    stone = countryEntity.resources.stone,
                    metal = countryEntity.resources.metal,
                )
            )
        }
        return CountryDTO(
            dataTier1 = dataTier1,
            dataTier3 = dataTier3
        )
    }


    private fun buildCity(cityEntity: CityEntity): CityDTO {
        return CityDTO(
            cityId = cityEntity.getKeyOrThrow(),
            countryId = cityEntity.countryId,
            tile = cityEntity.tile,
            name = cityEntity.name,
            color = cityEntity.color,
            city = cityEntity.city,
            parentCity = cityEntity.parentCity,
            buildings = cityEntity.buildings.map { BuildingDTO(it.type.name, it.tile) }
        )
    }

}

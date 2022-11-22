package de.ruegnerlukas.strategygame.backend.core.actions.sendstate

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.BuildingDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CityDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTODataTier1
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTODataTier3
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTOResources
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.MarkerTileDTOContent
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.ProvinceDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.ScoutTileDTOContent
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTODataTier0
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTODataTier1
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTODataTier2
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOOwner
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOVisibility
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

class GameExtendedDTOCreator(private val gameConfig: GameConfig) {

    private val metricId = metricCoreAction(GameExtendedDTOCreator::class)

    private val unknownCountryId = "?"
    private val unknownProvinceId = "?"
    private val unknownCityId = "?"

    fun create(userId: String, game: GameExtended): GameExtendedDTO {
        return Monitoring.time(metricId) {
            val playerCountry = game.countries.first { it.userId == userId }
            val knownCountryIds = getKnownCountryIds(playerCountry.countryId, game.tiles).toSet()

            val tileDTOs: List<TileDTO> = game.tiles
                .map { tileEntity -> buildTile(playerCountry.countryId, tileEntity, knownCountryIds, game.tiles) }

            val countryDTOs = knownCountryIds
                .map { countryId -> game.countries.first { it.countryId == countryId } }
                .map { country -> buildCountry(playerCountry.countryId, country) }

            val cityDTOs = game.cities
                .filter { city -> tileDTOs.first { it.dataTier0.tileId == city.tile.tileId }.dataTier0.visibility != TileDTOVisibility.UNKNOWN }
                .map { buildCity(it) }

            val provinceDTOs = game.provinces
                .filter { province -> province.cityIds.any { provinceCityId -> cityDTOs.find { it.cityId == provinceCityId } != null } }
                .map { buildProvince(it) }

            GameExtendedDTO(
                turn = game.game.turn,
                tiles = tileDTOs,
                countries = countryDTOs,
                cities = cityDTOs,
                provinces = provinceDTOs
            )
        }
    }


    private fun getKnownCountryIds(countryId: String, tiles: List<Tile>): List<String> {
        return (tiles
            .filter { calculateTileVisibility(countryId, it, tiles) != TileDTOVisibility.UNKNOWN }
            .mapNotNull { tile -> tile.owner?.countryId }
                + countryId)
            .distinct()
    }


    private fun calculateTileVisibility(countryId: String, tile: Tile, tiles: List<Tile>): TileDTOVisibility {
        if (tile.discoveredByCountries.contains(countryId)) {

            val scoutNearby = positionsCircle(tile.position, gameConfig.scoutVisibilityRange)
                .asSequence()
                .mapNotNull { pos -> tiles.find { it.position.q == pos.q && it.position.r == pos.r } }
                .mapNotNull { t -> t.content.find { it is ScoutTileContent }?.let { it as ScoutTileContent } }
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


    private fun buildTile(countryId: String, tile: Tile, knownCountries: Set<String>, tiles: List<Tile>): TileDTO {
        val baseData = buildTileDataTier0(countryId, tile, tiles)
        var generalData: TileDTODataTier1? = null
        var advancedData: TileDTODataTier2? = null
        if (baseData.visibility == TileDTOVisibility.DISCOVERED || baseData.visibility == TileDTOVisibility.VISIBLE) {
            generalData = buildTileDataTier1(tile)
        }
        if (baseData.visibility == TileDTOVisibility.VISIBLE) {
            advancedData = buildTileDataTier2(countryId, tile, knownCountries)
        }
        return TileDTO(
            dataTier0 = baseData,
            dataTier1 = generalData,
            dataTier2 = advancedData
        )
    }

    private fun buildTileDataTier0(countryId: String, tile: Tile, tiles: List<Tile>): TileDTODataTier0 {
        return TileDTODataTier0(
            tileId = tile.tileId,
            position = tile.position,
            visibility = calculateTileVisibility(countryId, tile, tiles)
        )
    }

    private fun buildTileDataTier1(tile: Tile): TileDTODataTier1 {
        return TileDTODataTier1(
            terrainType = tile.data.terrainType,
            resourceType = tile.data.resourceType,
            owner = tile.owner?.let { TileDTOOwner(it.countryId, it.provinceId, it.cityId) }
        )
    }

    private fun buildTileDataTier2(countryId: String, tile: Tile, knownCountries: Set<String>): TileDTODataTier2 {
        return TileDTODataTier2(
            influences = buildTileInfluences(countryId, tile, knownCountries),
            content = tile.content.map {
                when (it) {
                    is MarkerTileContent -> MarkerTileDTOContent(it.countryId)
                    is ScoutTileContent -> ScoutTileDTOContent(it.countryId, it.turn)
                }
            }
        )
    }

    private fun buildTileInfluences(countryId: String, tile: Tile, knownCountries: Set<String>): List<TileDTOInfluence> {
        val influences = mutableListOf<TileDTOInfluence>()
        influences.addAll( // player country
            tile.influences
                .filter { influence -> influence.countryId == countryId }
                .map { influence ->
                    TileDTOInfluence(
                        countryId = influence.countryId,
                        provinceId = influence.provinceId,
                        cityId = influence.cityId,
                        amount = influence.amount
                    )
                }
        )
        influences.addAll( // foreign known countries
            tile.influences
                .filter { influence -> influence.countryId != countryId && knownCountries.contains(influence.countryId) }
                .map { influence ->
                    TileDTOInfluence(
                        countryId = influence.countryId,
                        provinceId = influence.provinceId,
                        cityId = influence.cityId,
                        amount = influence.amount
                    )
                }
        )
        TileDTOInfluence(
            countryId = unknownCountryId,
            provinceId = unknownProvinceId,
            cityId = unknownCityId,
            amount = tile.influences
                .filter { influence -> !knownCountries.contains(influence.countryId) }
                .sumOf { influence -> influence.amount },
        ).let {
            if (it.amount > 0) {
                influences.add(it)
            }
        }
        return influences
    }


    private fun buildCountry(playerCountryId: String, country: Country): CountryDTO {
        val dataTier1 = CountryDTODataTier1(
            countryId = country.countryId,
            userId = country.userId,
            color = country.color
        )
        var dataTier3: CountryDTODataTier3? = null
        if (playerCountryId == country.countryId) {
            dataTier3 = CountryDTODataTier3(
                resources = CountryDTOResources(
                    money = country.resources.money,
                    wood = country.resources.wood,
                    food = country.resources.food,
                    stone = country.resources.stone,
                    metal = country.resources.metal,
                )
            )
        }
        return CountryDTO(
            dataTier1 = dataTier1,
            dataTier3 = dataTier3
        )
    }


    private fun buildCity(city: City): CityDTO {
        return CityDTO(
            cityId = city.cityId,
            countryId = city.countryId,
            tile = city.tile,
            name = city.name,
            color = city.color,
            city = city.isProvinceCapital,
            buildings = city.buildings.map { BuildingDTO(it.type.name, it.tile) }
        )
    }


    private fun buildProvince(province: Province): ProvinceDTO {
        return ProvinceDTO(
            provinceId = province.provinceId,
            countryId = province.countryId,
            cityIds = province.cityIds,
            provinceCapitalCityId = province.provinceCapitalCityId,
        )
    }

}

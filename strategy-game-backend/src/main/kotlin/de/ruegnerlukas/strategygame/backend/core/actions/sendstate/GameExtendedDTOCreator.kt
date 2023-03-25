package de.ruegnerlukas.strategygame.backend.core.actions.sendstate

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.Route
import de.ruegnerlukas.strategygame.backend.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.BuildingDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CityDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTODataTier1
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.MarkerTileDTOContent
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.ProductionQueueEntryDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.ProvinceDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.ProvinceDataTier3
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.RouteDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.ScoutTileDTOContent
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTODataTier0
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTODataTier1
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTODataTier2
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOOwner
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOVisibility
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService.Companion.metricCoreAction
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
                .map { country -> buildCountry(country) }

            val cityDTOs = game.cities
                .filter { city -> tileDTOs.first { it.dataTier0.tileId == city.tile.tileId }.dataTier0.visibility != TileDTOVisibility.UNKNOWN }
                .map { buildCity(it) }

            val provinceDTOs = game.provinces
                .filter { province -> province.cityIds.any { provinceCityId -> cityDTOs.find { it.cityId == provinceCityId } != null } }
                .map { buildProvince(it, playerCountry.countryId) }

            val routeDTOs = game.routes
                .filter { knowsRoute(it, cityDTOs) }
                .map { buildRoute(it) }

            GameExtendedDTO(
                turn = game.game.turn,
                tiles = tileDTOs,
                countries = countryDTOs,
                cities = cityDTOs,
                provinces = provinceDTOs,
                routes = routeDTOs
            )
        }
    }

    private fun getKnownCountryIds(countryId: String, tiles: TileContainer): List<String> {
        return (tiles
            .filter { calculateTileVisibility(countryId, it, tiles) != TileDTOVisibility.UNKNOWN }
            .mapNotNull { tile -> tile.owner?.countryId }
                + countryId)
            .distinct()
    }

    private fun calculateTileVisibility(countryId: String, tile: Tile, tiles: TileContainer): TileDTOVisibility {
        if (tile.discoveredByCountries.contains(countryId)) {

            val scoutNearby = positionsCircle(tile.position, gameConfig.scoutVisibilityRange)
                .asSequence()
                .mapNotNull { pos -> tiles.get(pos) }
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

    private fun buildTile(countryId: String, tile: Tile, knownCountries: Set<String>, tiles: TileContainer): TileDTO {
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

    private fun buildTileDataTier0(countryId: String, tile: Tile, tiles: TileContainer): TileDTODataTier0 {
        return TileDTODataTier0(
            tileId = tile.tileId,
            position = tile.position,
            visibility = calculateTileVisibility(countryId, tile, tiles)
        )
    }

    private fun buildTileDataTier1(tile: Tile): TileDTODataTier1 {
        return TileDTODataTier1(
            terrainType = tile.data.terrainType.name,
            resourceType = tile.data.resourceType.name,
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

    private fun buildCountry(country: Country): CountryDTO {
        val dataTier1 = CountryDTODataTier1(
            countryId = country.countryId,
            userId = country.userId,
            color = country.color
        )
        return CountryDTO(
            dataTier1 = dataTier1,
        )
    }

    private fun buildCity(city: City): CityDTO {
        return CityDTO(
            cityId = city.cityId,
            countryId = city.countryId,
            tile = city.tile,
            name = city.name,
            color = city.color,
            isProvinceCapital = city.isProvinceCapital,
            buildings = city.buildings.map { BuildingDTO(it.type.name, it.tile, it.active) },
            productionQueue = city.productionQueue.map {
                ProductionQueueEntryDTO(
                    entryId = it.entryId,
                    buildingType = it.buildingType,
                    progress = calculateProductionQueueEntryProgress(it)
                )
            }
        )
    }

    private fun calculateProductionQueueEntryProgress(entry: ProductionQueueEntry): Float {
        val totalRequired = entry.getTotalRequiredResources().fold(0f) { a, b -> a + b.amount }
        val totalCollected = entry.collectedResources.toList().fold(0f) { a, b -> a + b.second }
        if (totalRequired < 0.0001) {
            return 1f
        } else {
            return totalCollected / totalRequired
        }
    }

    private fun buildProvince(province: Province, playerCountryId: String): ProvinceDTO {
        return ProvinceDTO(
            provinceId = province.provinceId,
            countryId = province.countryId,
            cityIds = province.cityIds,
            provinceCapitalCityId = province.provinceCapitalCityId,
            dataTier3 = if (playerCountryId == province.countryId) {
                ProvinceDataTier3(
                    resourceBalance = ResourceType.values().associateWith { type ->
                        province.resourcesProducedPrevTurn[type] - province.resourcesConsumedCurrTurn[type]
                    }
                )
            } else {
                null
            }
        )
    }

    private fun knowsRoute(route: Route, cityDTOs: List<CityDTO>): Boolean {
        val cityA = cityDTOs.find { it.cityId == route.cityIdA }
        val cityB = cityDTOs.find { it.cityId == route.cityIdA }
        return cityA != null && cityB != null
    }

    private fun buildRoute(route: Route): RouteDTO {
        return RouteDTO(
            routeId = route.routeId,
            cityIdA = route.cityIdA,
            cityIdB = route.cityIdB,
            path = route.path
        )
    }

}

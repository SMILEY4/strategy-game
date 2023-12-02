package de.ruegnerlukas.strategygame.backend.testdsl.modifiers

import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLog
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.terrain.TerrainResourceType
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor
import de.ruegnerlukas.strategygame.backend.common.utils.UUID
import de.ruegnerlukas.strategygame.backend.common.utils.coApply
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedger
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedgerDetailBuilderImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.CityEntity
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.ProvinceEntity
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.RouteEntity
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.TileEntity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Building
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityInfrastructure
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityMetadata
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityPopulation
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Route
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlementTier
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getGameExtended
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils.TileDirection
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils.direction


suspend fun GameTestContext.addTileResources(refQ: Int, refR: Int, block: AddTileResourcesDirectActionDsl.() -> Unit) {
    val dslConfig = AddTileResourcesDirectActionDsl().apply(block)
    TestUtils.getTiles(getDb(), getActiveGame()).also { tiles ->
        setTileResource(getDb(), getActiveGame(), tiles, refQ - 1, refR + 1, dslConfig.topLeft)
        setTileResource(getDb(), getActiveGame(), tiles, refQ + 0, refR + 1, dslConfig.topRight)
        setTileResource(getDb(), getActiveGame(), tiles, refQ - 1, refR + 0, dslConfig.left)
        setTileResource(getDb(), getActiveGame(), tiles, refQ + 0, refR + 0, dslConfig.center)
        setTileResource(getDb(), getActiveGame(), tiles, refQ + 1, refR + 0, dslConfig.right)
        setTileResource(getDb(), getActiveGame(), tiles, refQ + 0, refR - 1, dslConfig.bottomLeft)
        setTileResource(getDb(), getActiveGame(), tiles, refQ + 1, refR - 1, dslConfig.bottomRight)
    }
}

private suspend fun setTileResource(
    database: ArangoDatabase,
    gameId: String,
    tiles: Collection<Tile>,
    q: Int,
    r: Int,
    resourceType: TerrainResourceType?
) {
    if (resourceType != null) {
        tiles.find { it.position.q == q && it.position.r == r }
            ?.also { it.data.resourceType = resourceType }
            ?.also { saveTile(it, gameId, database) }
    }
}

private suspend fun saveTile(tile: Tile, gameId: String, database: ArangoDatabase) {
    TileEntity.of(tile, gameId).also { entity ->
        database.updateDocument(Collections.TILES, entity.key!!, entity)
    }
}

class AddTileResourcesDirectActionDsl {
    var topLeft: TerrainResourceType? = null
    var topRight: TerrainResourceType? = null
    var left: TerrainResourceType? = null
    var right: TerrainResourceType? = null
    var bottomLeft: TerrainResourceType? = null
    var bottomRight: TerrainResourceType? = null
    var center: TerrainResourceType? = null

    fun all(type: TerrainResourceType) {
        allNeighbours(type)
        center = type
    }

    fun allNeighbours(type: TerrainResourceType) {
        topLeft = type
        topRight = type
        left = type
        right = type
        bottomLeft = type
        bottomRight = type
    }

}


suspend fun GameTestContext.addCity(block: suspend AddCityDirectActionDsl.() -> Unit) {
    val dslConfig = AddCityDirectActionDsl().coApply(block)
    val tiles = TestUtils.getTiles(getDb(), getActiveGame())
    val city = City(
        cityId = UUID.gen(),
        countryId = dslConfig.countryId!!,
        tile = TileRef(tiles.find { it.position == dslConfig.tile }!!),
        tier = dslConfig.tier ?: SettlementTier.CITY,
        meta = CityMetadata(
            name = dslConfig.name!!,
            color = RGBColor.random(),
            isProvinceCapital = true,
        ),
        infrastructure = CityInfrastructure(
            buildings = dslConfig.buildings.map { (type, dir) ->
                Building(
                    type = type,
                    tile = dir?.let { d -> TileRef(tiles.find { it.position == dslConfig.tile!!.direction(d) }!!) },
                    active = true,
                    details = DetailLog()
                )
            }.toMutableList(),
            productionQueue = dslConfig.queue.map { buildingType ->
                BuildingProductionQueueEntry(
                    entryId = UUID.gen(),
                    buildingType = buildingType,
                    collectedResources = ResourceCollection.basic()
                )
            }.toMutableList()
        ),
        population = CityPopulation(
            size = dslConfig.initialSize ?: (dslConfig.tier ?: SettlementTier.CITY).minRequiredSize,
            growthProgress = 0f,
        ),
    )
    CityEntity.of(city, getActiveGame()).also { entity ->
        getDb().insertDocument(Collections.CITIES, entity)
    }
    val province = Province(
        provinceId = UUID.gen(),
        countryId = city.countryId,
        cityIds = mutableListOf(city.cityId),
        provinceCapitalCityId = city.cityId,
        color = RGBColor.random(),
        resourceLedger = ResourceLedger()
    )
    ProvinceEntity.of(province, getActiveGame()).also { entity ->
        getDb().insertDocument(Collections.PROVINCES, entity)
    }
}

suspend fun GameTestContext.addTown(parentCity: String, block: suspend AddCityDirectActionDsl.() -> Unit) {
    val dslConfig = AddCityDirectActionDsl().coApply(block)
    val tiles = TestUtils.getTiles(getDb(), getActiveGame())
    val city = City(
        cityId = UUID.gen(),
        countryId = dslConfig.countryId!!,
        tile = TileRef(tiles.find { it.position == dslConfig.tile }!!),
        tier = dslConfig.tier ?: SettlementTier.TOWN,
        meta = CityMetadata(
            name = dslConfig.name!!,
            color = RGBColor.random(),
            isProvinceCapital = false,
        ),
        infrastructure = CityInfrastructure(
            buildings = dslConfig.buildings.map { (type, dir) ->
                Building(
                    type = type,
                    tile = dir?.let { d -> TileRef(tiles.find { it.position == dslConfig.tile!!.direction(d) }!!) },
                    active = true,
                    details = DetailLog()
                )
            }.toMutableList(),
            productionQueue = dslConfig.queue.map { buildingType ->
                BuildingProductionQueueEntry(
                    entryId = UUID.gen(),
                    buildingType = buildingType,
                    collectedResources = ResourceCollection.basic()
                )
            }.toMutableList()
        ),
        population = CityPopulation(
            size = dslConfig.initialSize ?: (dslConfig.tier ?: SettlementTier.TOWN).minRequiredSize,
            growthProgress = 0f,
        ),
    )
    CityEntity.of(city, getActiveGame()).also { entity ->
        getDb().insertDocument(Collections.CITIES, entity)
    }
    val province = TestUtils.getProvinceByCityId(getDb(), parentCity).also {
        it.cityIds.add(city.cityId)
    }
    ProvinceEntity.of(province, getActiveGame()).also { entity ->
        getDb().updateDocument(Collections.PROVINCES, entity.key!!, entity)
    }
}

class AddCityDirectActionDsl {
    var tier: SettlementTier? = null
    var countryId: String? = null
    var tile: TilePosition? = null
    var name: String? = null
    var buildings = mutableListOf<Pair<BuildingType, TileDirection?>>()
    var queue = mutableListOf<BuildingType>()
    var initialSize: Int? = null

    fun building(type: BuildingType, position: TileDirection? = null) {
        buildings.add(type to position)
    }

    fun queueConstructBuilding(type: BuildingType) {
        queue.add(type)
    }

}


suspend fun GameTestContext.addRoute(nameCityA: String, nameCityB: String) {
    val cityIdA = getGameExtended().cities.find { it.meta.name == nameCityA }!!.cityId
    val cityIdB = getGameExtended().cities.find { it.meta.name == nameCityB }!!.cityId
    val route = Route(
        routeId = UUID.gen(),
        cityIdA = cityIdA,
        cityIdB = cityIdB,
        path = listOf()
    )
    RouteEntity.of(route, getActiveGame()).also { entity ->
        getDb().insertDocument(Collections.ROUTES, entity)
    }
}

suspend fun GameTestContext.addSettlers(countryId: String, amount: Int) {
    val country = TestUtils.getCountry(getDb(), countryId)
    country.availableSettlers += amount
    getDb().updateDocument(Collections.COUNTRIES, countryId, country)
}
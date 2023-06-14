package de.ruegnerlukas.strategygame.backend.testdsl.modifiers

import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.ProvinceEntity
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.RouteEntity
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.ports.models.Route
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor
import de.ruegnerlukas.strategygame.backend.common.utils.UUID
import de.ruegnerlukas.strategygame.backend.common.utils.coApply
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
    resourceType: TileResourceType?
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
    var topLeft: TileResourceType? = null
    var topRight: TileResourceType? = null
    var left: TileResourceType? = null
    var right: TileResourceType? = null
    var bottomLeft: TileResourceType? = null
    var bottomRight: TileResourceType? = null
    var center: TileResourceType? = null

    fun all(type: TileResourceType) {
        allNeighbours(type)
        center = type
    }

    fun allNeighbours(type: TileResourceType) {
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
        name = dslConfig.name!!,
        color = RGBColor.random(),
        isProvinceCapital = true,
        size = 1,
        growthProgress = 0f,
        buildings = dslConfig.buildings.map { (type, dir) ->
            Building(
                type = type,
                tile = dir?.let { d -> TileRef(tiles.find { it.position == dslConfig.tile!!.direction(d) }!!) },
                active = true
            )
        }.toMutableList(),
        productionQueue = dslConfig.queue.map { buildingType ->
            BuildingProductionQueueEntry(
                entryId = UUID.gen(),
                buildingType = buildingType,
                collectedResources = ResourceCollection.basic()
            )
        }.toMutableList()
    )
    CityEntity.of(city, getActiveGame()).also { entity ->
        getDb().insertDocument(Collections.CITIES, entity)
    }
    val province = Province(
        provinceId = UUID.gen(),
        countryId = city.countryId,
        cityIds = mutableListOf(city.cityId),
        provinceCapitalCityId = city.cityId,
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
        name = dslConfig.name!!,
        color = RGBColor.random(),
        isProvinceCapital = false,
        size = 1,
        growthProgress = 0f,
        buildings = dslConfig.buildings.map { (type, dir) ->
            Building(
                type = type,
                tile = dir?.let { d -> TileRef(tiles.find { it.position == dslConfig.tile!!.direction(d) }!!) },
                active = true
            )
        }.toMutableList(),
        productionQueue = dslConfig.queue.map { buildingType ->
            BuildingProductionQueueEntry(
                entryId = UUID.gen(),
                buildingType = buildingType,
                collectedResources = ResourceCollection.basic()
            )
        }.toMutableList()
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
    var countryId: String? = null
    var tile: TilePosition? = null
    var name: String? = null
    var buildings = mutableListOf<Pair<BuildingType, TileDirection?>>()
    var queue = mutableListOf<BuildingType>()

    fun building(type: BuildingType, position: TileDirection? = null) {
        buildings.add(type to position)
    }

    fun queueConstructBuilding(type: BuildingType) {
        queue.add(type)
    }

}


suspend fun GameTestContext.addRoute(nameCityA: String, nameCityB: String) {
    val cityIdA = getGameExtended().cities.find { it.name == nameCityA }!!.cityId
    val cityIdB = getGameExtended().cities.find { it.name == nameCityB }!!.cityId
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
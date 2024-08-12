package io.github.smiley4.strategygame.backend.worlds.module.persistence

import arrow.fx.coroutines.parZip
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.GameMeta
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileContainer
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.tracking
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.SettlementEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.CountryEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.GameEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.ProvinceEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.RouteEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.TileEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.WorldObjectEntity

internal class GameExtendedQuery(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameExtendedQuery::class)

    suspend fun execute(gameId: String): GameExtended {
        return time(metricId) {
            val game = fetchGame(gameId)
            parZip(
                { fetchCountries(gameId) },
                { fetchTiles(gameId) },
                { fetchWorldObjects(gameId) },
                { fetchCities(gameId) },
                { fetchProvinces(gameId) },
                { fetchRoutes(gameId) }
            ) { countries, tiles, worldObjects, cities, provinces, routes ->
                GameExtended(
                    meta = GameMeta(
                        gameId = gameId,
                        turn = game.turn
                    ),
                    countries = countries.tracking(),
                    tiles = TileContainer(tiles),
                    worldObjects = worldObjects.tracking(),
                    settlements = cities.tracking(),
                    provinces = provinces.tracking(),
                    routes = routes.tracking()
                )
            }
        }
    }

    private suspend fun fetchGame(gameId: String): GameEntity {
        try {
            return database.getDocument(Collections.GAMES, gameId, GameEntity::class.java)
        } catch (e: DocumentNotFoundError) {
            throw EntityNotFoundError()
        }
    }

    private suspend fun fetchCountries(gameId: String): List<Country> {
        database.assertCollections(Collections.COUNTRIES)
        return database.query(
            """
				FOR country IN ${Collections.COUNTRIES}
					FILTER country.gameId == @gameId
					RETURN country
			""".trimIndent(),
            mapOf("gameId" to gameId),
            CountryEntity::class.java
        ).map { it.asServiceModel() }
    }

    private suspend fun fetchTiles(gameId: String): List<Tile> {
        database.assertCollections(Collections.TILES)
        return database.query(
            """
				FOR tile IN ${Collections.TILES}
					FILTER tile.gameId == @gameId
					RETURN tile
			""".trimIndent(),
            mapOf("gameId" to gameId),
            TileEntity::class.java
        ).map { it.asServiceModel() }
    }

    private suspend fun fetchCities(gameId: String): List<Settlement> {
        database.assertCollections(Collections.CITIES)
        return database.query(
            """
				FOR city IN ${Collections.CITIES}
					FILTER city._documentType != "reservation"
					FILTER city.gameId == @gameId
					RETURN city
			""".trimIndent(),
            mapOf("gameId" to gameId),
            SettlementEntity::class.java
        ).map { it.asServiceModel() }
    }

    private suspend fun fetchProvinces(gameId: String): List<Province> {
        database.assertCollections(Collections.PROVINCES)
        return database.query(
            """
				FOR province IN ${Collections.PROVINCES}
					FILTER province._documentType != "reservation"
					FILTER province.gameId == @gameId
					RETURN province
			""".trimIndent(),
            mapOf("gameId" to gameId),
            ProvinceEntity::class.java
        ).map { it.asServiceModel() }
    }

    private suspend fun fetchRoutes(gameId: String): List<Route> {
        database.assertCollections(Collections.ROUTES)
        return database.query(
            """
				FOR route IN ${Collections.ROUTES}
					FILTER route._documentType != "reservation"
					FILTER route.gameId == @gameId
					RETURN route
			""".trimIndent(),
            mapOf("gameId" to gameId),
            RouteEntity::class.java
        ).map { it.asServiceModel() }
    }

    private suspend fun fetchWorldObjects(gameId: String): List<WorldObject> {
        database.assertCollections(Collections.WORLD_OBJECTS)
        return database.query(
            """
				FOR worldObject IN ${Collections.WORLD_OBJECTS}
					FILTER worldObject._documentType != "reservation"
					FILTER worldObject.gameId == @gameId
					RETURN worldObject
			""".trimIndent(),
            mapOf("gameId" to gameId),
            WorldObjectEntity::class.java
        ).map { it.asServiceModel() }
    }

}
package io.github.smiley4.strategygame.backend.engine.external.persistence

import arrow.fx.coroutines.parZip
import io.github.smiley4.strategygame.backend.common.models.GameEntity
import io.github.smiley4.strategygame.backend.common.models.GameMeta
import io.github.smiley4.strategygame.backend.common.models.tracking
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.EntityNotFoundError
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.common.persistence.arango.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.CityEntity
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.CountryEntity
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.ProvinceEntity
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.RouteEntity
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.TileEntity
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.Province
import io.github.smiley4.strategygame.backend.engine.ports.models.Route
import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.engine.ports.models.TileContainer
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExtendedQuery

class GameExtendedQueryImpl(private val database: ArangoDatabase) : GameExtendedQuery {

    private val metricId = MetricId.query(GameExtendedQuery::class)

    override suspend fun execute(gameId: String): GameExtended {
        return time(metricId) {
            val game = fetchGame(gameId)
            parZip(
                { fetchCountries(gameId) },
                { fetchTiles(gameId) },
                { fetchCities(gameId) },
                { fetchProvinces(gameId) },
                { fetchRoutes(gameId) }
            ) { countries, tiles, cities, provinces, routes ->
                GameExtended(
                    meta = GameMeta(
                        gameId = gameId,
                        turn = game.turn
                    ),
                    countries = countries,
                    tiles = TileContainer(tiles),
                    cities = cities.tracking(),
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

    private suspend fun fetchCities(gameId: String): List<City> {
        database.assertCollections(Collections.CITIES)
        return database.query(
            """
				FOR city IN ${Collections.CITIES}
					FILTER city._documentType != "reservation"
					FILTER city.gameId == @gameId
					RETURN city
			""".trimIndent(),
            mapOf("gameId" to gameId),
            CityEntity::class.java
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

}
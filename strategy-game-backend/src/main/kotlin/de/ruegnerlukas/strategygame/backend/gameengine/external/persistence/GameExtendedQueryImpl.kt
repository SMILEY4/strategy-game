package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import arrow.core.Either
import arrow.core.continuations.either
import arrow.fx.coroutines.parZip
import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Province
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TileContainer
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.ProvinceEntity
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.RouteEntity
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.GameMeta
import de.ruegnerlukas.strategygame.backend.common.models.Route
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.common.models.tracking

class GameExtendedQueryImpl(private val database: ArangoDatabase) : GameExtendedQuery {

    private val metricId = metricDbQuery(GameExtendedQuery::class)

    override suspend fun execute(gameId: String): Either<EntityNotFoundError, GameExtended> {
        return Monitoring.coTime(metricId) {
            either {
                val game = fetchGame(gameId).bind()
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
    }

    private suspend fun fetchGame(gameId: String): Either<EntityNotFoundError, Game> {
        return database.getDocument(Collections.GAMES, gameId, GameEntity::class.java)
            .map { it.asServiceModel() }
            .mapLeft { EntityNotFoundError }
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
package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.ProvinceEntity
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.RouteEntity
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Province
import de.ruegnerlukas.strategygame.backend.common.models.Route
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.common.parallelIO

class GameExtendedUpdateImpl(private val database: ArangoDatabase) : GameExtendedUpdate {

    private val metricId = metricDbQuery(GameExtendedUpdate::class)

    override suspend fun execute(game: GameExtended): Either<EntityNotFoundError, Unit> {
        return Monitoring.coTime(metricId) {
            either {
                val gameId = game.game.gameId
                updateGame(game.game).bind()
                parallelIO(
                    { updateCountries(game.countries, gameId) },
                    { updateTiles(game.tiles, gameId) },
                    { updateCities(game.cities, gameId) },
                    { deleteCities(game.cities.getRemovedElements(), gameId) },
                    { updateProvinces(game.provinces, gameId) },
                    { deleteProvinces(game.provinces.getRemovedElements(), gameId) },
                    { updateRoutes(game.routes, gameId) },
                    { deleteRoutes(game.routes.getRemovedElements(), gameId) }
                )
            }
        }
    }

    private suspend fun updateGame(game: Game): Either<EntityNotFoundError, Unit> {
        val entity = GameEntity.of(game)
        return database.updateDocument(Collections.GAMES, entity.getKeyOrThrow(), entity)
            .mapLeft { EntityNotFoundError }
            .void()
    }

    private suspend fun updateCountries(countries: List<Country>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.COUNTRIES, countries.map { CountryEntity.of(it, gameId) })
    }

    private suspend fun updateTiles(tiles: Collection<Tile>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) })
    }

    private suspend fun updateCities(cities: List<City>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.CITIES, cities.map { CityEntity.of(it, gameId) })
    }

    private suspend fun deleteCities(cities: Set<City>, gameId: String) {
        database.deleteDocuments(Collections.CITIES, cities.map { CityEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateProvinces(provinces: List<Province>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.PROVINCES, provinces.map { ProvinceEntity.of(it, gameId) })
    }

    private suspend fun deleteProvinces(provinces: Set<Province>, gameId: String) {
        database.deleteDocuments(Collections.PROVINCES, provinces.map { ProvinceEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateRoutes(routes: List<Route>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.ROUTES, routes.map { RouteEntity.of(it, gameId) })
    }

    private suspend fun deleteRoutes(routes: Set<Route>, gameId: String) {
        database.deleteDocuments(Collections.ROUTES, routes.map { RouteEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

}
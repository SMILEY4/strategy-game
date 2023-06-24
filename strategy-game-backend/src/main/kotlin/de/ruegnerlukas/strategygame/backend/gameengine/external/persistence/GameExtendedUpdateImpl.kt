package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.GameMeta
import de.ruegnerlukas.strategygame.backend.common.models.Province
import de.ruegnerlukas.strategygame.backend.common.models.Route
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.utils.Err
import de.ruegnerlukas.strategygame.backend.common.utils.Ok
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.parallelIO
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.ProvinceEntity
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.RouteEntity
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedUpdate

class GameExtendedUpdateImpl(private val database: ArangoDatabase) : GameExtendedUpdate {

    private val metricId = metricDbQuery(GameExtendedUpdate::class)

    override suspend fun execute(game: GameExtended): Either<EntityNotFoundError, Unit> {
        return Monitoring.coTime(metricId) {
            either {
                val gameId = game.meta.gameId
                updateGame(game.meta).bind()
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

    private suspend fun updateGame(gameMeta: GameMeta): Either<EntityNotFoundError, Unit> {
        return when (val game = database.getDocument(Collections.GAMES, gameMeta.gameId, GameEntity::class.java)) {
            is Ok -> {
                val entity = GameEntity.of(gameMeta, game.value)
                return database.updateDocument(Collections.GAMES, entity.getKeyOrThrow(), entity)
                    .mapLeft { EntityNotFoundError }
                    .void()
            }
            is Err -> EntityNotFoundError.err()
        }
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
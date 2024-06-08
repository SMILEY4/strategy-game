package io.github.smiley4.strategygame.backend.engine.external.persistence

import io.github.smiley4.strategygame.backend.common.models.GameEntity
import io.github.smiley4.strategygame.backend.common.models.GameMeta
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.EntityNotFoundError
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.common.persistence.arango.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.common.utils.parallelIO
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
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExtendedUpdate

class GameExtendedUpdateImpl(private val database: ArangoDatabase) : GameExtendedUpdate {

    private val metricId = MetricId.query(GameExtendedUpdate::class)

    override suspend fun execute(game: GameExtended) {
        return time(metricId) {
            val gameId = game.meta.gameId
            updateGame(game.meta)
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

    private suspend fun updateGame(gameMeta: GameMeta) {
        try {
            val game = database.getDocument(Collections.GAMES, gameMeta.gameId, GameEntity::class.java)
            val entity = GameEntity.of(gameMeta, game)
            database.updateDocument(Collections.GAMES, entity.getKeyOrThrow(), entity)
        } catch (e: DocumentNotFoundError) {
            throw EntityNotFoundError()
        }
    }

    private suspend fun updateCountries(countries: Collection<Country>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.COUNTRIES, countries.map { CountryEntity.of(it, gameId) })
    }

    private suspend fun updateTiles(tiles: Collection<Tile>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) })
    }

    private suspend fun updateCities(cities: Collection<City>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.CITIES, cities.map { CityEntity.of(it, gameId) })
    }

    private suspend fun deleteCities(cities: Set<City>, gameId: String) {
        database.deleteDocuments(Collections.CITIES, cities.map { CityEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateProvinces(provinces: Collection<Province>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.PROVINCES, provinces.map { ProvinceEntity.of(it, gameId) })
    }

    private suspend fun deleteProvinces(provinces: Set<Province>, gameId: String) {
        database.deleteDocuments(Collections.PROVINCES, provinces.map { ProvinceEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateRoutes(routes: Collection<Route>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.ROUTES, routes.map { RouteEntity.of(it, gameId) })
    }

    private suspend fun deleteRoutes(routes: Set<Route>, gameId: String) {
        database.deleteDocuments(Collections.ROUTES, routes.map { RouteEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

}
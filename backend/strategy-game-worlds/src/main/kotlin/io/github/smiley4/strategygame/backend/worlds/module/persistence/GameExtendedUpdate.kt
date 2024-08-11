package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.parallelIO
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
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.SettlementEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.CountryEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.GameEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.ProvinceEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.RouteEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.TileEntity
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.WorldObjectEntity

internal class GameExtendedUpdate(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameExtendedUpdate::class)

    suspend fun execute(game: GameExtended) {
        return time(metricId) {
            val gameId = game.meta.gameId
            updateGame(game.meta)
            parallelIO(
                { updateTiles(game.tiles, gameId) },
                { updateCountries(game.countries, gameId) },
                { deleteCountries(game.countries.getRemovedElements(), gameId) },
                { updateCities(game.settlements, gameId) },
                { deleteCities(game.settlements.getRemovedElements(), gameId) },
                { updateProvinces(game.provinces, gameId) },
                { deleteProvinces(game.provinces.getRemovedElements(), gameId) },
                { updateRoutes(game.routes, gameId) },
                { deleteRoutes(game.routes.getRemovedElements(), gameId) },
                { updateWorldObjects(game.worldObjects, gameId) },
                { deleteWorldObjects(game.worldObjects.getRemovedElements(), gameId) }
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

    private suspend fun updateTiles(tiles: Collection<Tile>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) })
    }

    private suspend fun updateCountries(countries: Collection<Country>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.COUNTRIES, countries.map { CountryEntity.of(it, gameId) })
    }

    private suspend fun deleteCountries(countries: Collection<Country>, gameId: String) {
        database.deleteDocuments(Collections.COUNTRIES, countries.map { CountryEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateCities(cities: Collection<Settlement>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.CITIES, cities.map { SettlementEntity.of(it, gameId) })
    }

    private suspend fun deleteCities(cities: Set<Settlement>, gameId: String) {
        database.deleteDocuments(Collections.CITIES, cities.map { SettlementEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
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

    private suspend fun updateWorldObjects(worldObjects: Collection<WorldObject>, gameId: String) {
        database.insertOrReplaceDocuments(Collections.WORLD_OBJECTS, worldObjects.map { WorldObjectEntity.of(it, gameId) })
    }

    private suspend fun deleteWorldObjects(worldObjects: Set<WorldObject>, gameId: String) {
        database.deleteDocuments(Collections.WORLD_OBJECTS, worldObjects.map { WorldObjectEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

}
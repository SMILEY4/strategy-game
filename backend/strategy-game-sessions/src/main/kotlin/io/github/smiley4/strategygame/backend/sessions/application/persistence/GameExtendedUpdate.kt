package io.github.smiley4.strategygame.backend.sessions.application.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.parallelIO
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.GameMeta
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.CountryEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.GameEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.ProvinceEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.RouteEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.SettlementEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.TileEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectEntityCollection.Companion.toTypedCollection

internal class GameExtendedUpdate(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameExtendedUpdate::class)

    suspend fun execute(game: GameExtended) {
        return time(metricId) {
            val gameId = game.meta.id.value
            updateGame(game.meta)
            parallelIO(
                { updateTiles(game.tiles, gameId) },
                { updateCountries(game.countries, gameId) },
                { deleteCountries(game.countries.getRemovedElements(), gameId) },
                { updateCities(game.settlements, gameId) },
                { deleteCities(game.settlements.getRemovedElements(), gameId) },
                { updateProvinces(game.provinces, gameId) },
                { deleteProvinces(game.provinces.getRemovedElements(), gameId) },
//                { updateRoutes(game.routes, gameId) },
//                { deleteRoutes(game.routes.getRemovedElements(), gameId) },
                { updateWorldObjects(game.worldObjects, gameId) },
                { deleteWorldObjects(game.worldObjects.getRemovedElements(), gameId) }
            )
        }
    }

    private suspend fun updateGame(gameMeta: GameMeta) {
        try {
            val game = database.getDocument(DbCollections.GAMES, gameMeta.id.value, GameEntity::class.java)
            val entity = GameEntity.of(gameMeta, game)
            database.updateDocument(DbCollections.GAMES, entity.getKeyOrThrow(), entity)
        } catch (e: DocumentNotFoundError) {
            throw EntityNotFoundError()
        }
    }

    private suspend fun updateTiles(tiles: Collection<Tile>, gameId: String) {
        database.insertOrReplaceDocuments(DbCollections.TILES, tiles.map { TileEntity.of(it, gameId) })
    }

    private suspend fun updateCountries(countries: Collection<Country>, gameId: String) {
        database.insertOrReplaceDocuments(DbCollections.COUNTRIES, countries.map { CountryEntity.of(it, gameId) })
    }

    private suspend fun deleteCountries(countries: Collection<Country>, gameId: String) {
        database.deleteDocuments(DbCollections.COUNTRIES, countries.map { CountryEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateCities(cities: Collection<Settlement>, gameId: String) {
        database.insertOrReplaceDocuments(DbCollections.SETTLEMENTS, cities.map { SettlementEntity.of(it, gameId) })
    }

    private suspend fun deleteCities(cities: Set<Settlement>, gameId: String) {
        database.deleteDocuments(DbCollections.SETTLEMENTS, cities.map { SettlementEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateProvinces(provinces: Collection<Province>, gameId: String) {
        database.insertOrReplaceDocuments(DbCollections.PROVINCES, provinces.map { ProvinceEntity.of(it, gameId) })
    }

    private suspend fun deleteProvinces(provinces: Set<Province>, gameId: String) {
        database.deleteDocuments(DbCollections.PROVINCES, provinces.map { ProvinceEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateRoutes(routes: Collection<Route>, gameId: String) {
        database.insertOrReplaceDocuments(DbCollections.ROUTES, routes.map { RouteEntity.of(it, gameId) })
    }

    private suspend fun deleteRoutes(routes: Set<Route>, gameId: String) {
        database.deleteDocuments(DbCollections.ROUTES, routes.map { RouteEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateWorldObjects(worldObjects: Collection<WorldObject>, gameId: String) {
        database.insertOrReplaceDocuments(DbCollections.WORLD_OBJECTS, worldObjects.map { WorldObjectEntity.of(it, gameId) }.toTypedCollection())
    }

    private suspend fun deleteWorldObjects(worldObjects: Set<WorldObject>, gameId: String) {
        database.deleteDocuments(DbCollections.WORLD_OBJECTS, worldObjects.map { WorldObjectEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

}
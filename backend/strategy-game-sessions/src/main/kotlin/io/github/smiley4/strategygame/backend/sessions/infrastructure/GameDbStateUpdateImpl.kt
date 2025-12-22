package io.github.smiley4.strategygame.backend.sessions.infrastructure

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.parallelIO
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.sessions._old.application.persistence.DbCollections
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.GameEntity
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.RealmEntity
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.RouteEntity
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.TileEntity
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.WorldObjectEntity

class GameDbStateUpdateImpl(private val database: ArangoDatabase) :
    io.github.smiley4.strategygame.backend.sessions.create.GameDbStateUpdate,
    io.github.smiley4.strategygame.backend.sessions.join.GameDbStateUpdate,
    io.github.smiley4.strategygame.backend.sessions.turnend.GameDbStateUpdate {

    private val metricId = MetricId.query(GameDbStateUpdateImpl::class)

    override suspend fun update(gameState: GameState) {
        return time(metricId) {
            val gameId = gameState.game.id.value
            updateGame(gameState.game)
            parallelIO(
                { updateTiles(gameState.tiles, gameId) },
                { updateRealms(gameState.realms, gameId) },
                { deleteRealms(gameState.realms.getRemovedElements(), gameId) },
                { updateWorldObjects(gameState.worldObjects, gameId) },
                { deleteWorldObjects(gameState.worldObjects.getRemovedElements(), gameId) },
                { updateRoutes(gameState.routes, gameId) },
                { deleteRoutes(gameState.routes.getRemovedElements(), gameId) },
            )
        }
    }

    private suspend fun updateGame(game: Game) {
        try {
            val entity = GameEntity.of(game)
            database.updateDocument(DbCollections.GAMES, entity.getKeyOrThrow(), entity)
        } catch (e: DocumentNotFoundError) {
            throw EntityNotFoundError()
        }
    }

    private suspend fun updateTiles(tiles: Collection<Tile>, gameId: String) {
        database.insertOrReplaceDocuments(DbCollections.TILES, tiles.map { TileEntity.of(it, gameId) })
    }

    private suspend fun updateRealms(countries: Collection<Realm>, gameId: String) {
        database.insertOrReplaceDocuments(DbCollections.REALMS, countries.map { RealmEntity.of(it, gameId) })
    }

    private suspend fun deleteRealms(countries: Collection<Realm>, gameId: String) {
        database.deleteDocuments(DbCollections.REALMS, countries.map { RealmEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateWorldObjects(worldObjects: Collection<WorldObject>, gameId: String) {
        database.insertOrReplaceDocuments(DbCollections.WORLD_OBJECTS, worldObjects.map { WorldObjectEntity.of(it, gameId) })
    }

    private suspend fun deleteWorldObjects(worldObjects: Set<WorldObject>, gameId: String) {
        database.deleteDocuments(
            DbCollections.WORLD_OBJECTS,
            worldObjects.map { WorldObjectEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

    private suspend fun updateRoutes(routes: Collection<Route>, gameId: String) {
        database.insertOrReplaceDocuments(DbCollections.ROUTES, routes.map { RouteEntity.of(it, gameId) })
    }

    private suspend fun deleteRoutes(routes: Set<Route>, gameId: String) {
        database.deleteDocuments(DbCollections.ROUTES, routes.map { RouteEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

}
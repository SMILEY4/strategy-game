package io.github.smiley4.strategygame.backend.sessions.application.persistence

import arrow.fx.coroutines.parZip
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.utils.tracking
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.GameEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.RealmEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.RouteEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.TileEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectEntity

internal class GameStateQuery(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameStateQuery::class)

    suspend fun execute(gameId: Game.Id): GameState {
        return time(metricId) {
            val game = fetchGame(gameId)
            parZip(
                { fetchRealms(gameId) },
                { fetchTiles(gameId) },
                { fetchWorldObjects(gameId) },
                { fetchRoutes(gameId) },
            ) { realms, tiles, worldObjects, routes ->
                GameState(
                    game = game,
                    realms = realms.tracking(),
                    tiles = Tile.Container(tiles),
                    worldObjects = worldObjects.tracking(),
                    routes = routes.tracking(),
                )
            }
        }
    }

    private suspend fun fetchGame(gameId: Game.Id): Game {
        try {
            return database.getDocument(DbCollections.GAMES, gameId.value, GameEntity::class.java).asServiceModel()
        } catch (e: DocumentNotFoundError) {
            throw EntityNotFoundError()
        }
    }

    private suspend fun fetchRealms(gameId: Game.Id): List<Realm> {
        database.assertCollections(DbCollections.REALMS)
        return database.query(
            //language=aql
            """
				FOR realm IN ${DbCollections.REALMS}
					FILTER realm.gameId == @gameId
					RETURN realm
			""".trimIndent(),
            mapOf("gameId" to gameId.value),
            RealmEntity::class.java
        ).map { it.asServiceModel() }
    }

    private suspend fun fetchTiles(gameId: Game.Id): List<Tile> {
        database.assertCollections(DbCollections.TILES)
        return database.query(
            //language=aql
            """
				FOR tile IN ${DbCollections.TILES}
					FILTER tile.gameId == @gameId
					RETURN tile
			""".trimIndent(),
            mapOf("gameId" to gameId.value),
            TileEntity::class.java
        ).map { it.asServiceModel() }
    }

    private suspend fun fetchWorldObjects(gameId: Game.Id): List<WorldObject> {
        database.assertCollections(DbCollections.WORLD_OBJECTS)
        return database.query(
            //language=aql
            """
				FOR worldObject IN ${DbCollections.WORLD_OBJECTS}
					FILTER worldObject._documentType != "reservation"
					FILTER worldObject.gameId == @gameId
					RETURN worldObject
			""".trimIndent(),
            mapOf("gameId" to gameId.value),
            WorldObjectEntity::class.java
        ).map { it.asServiceModel() }
    }

    private suspend fun fetchRoutes(gameId: Game.Id): List<Route> {
        database.assertCollections(DbCollections.ROUTES)
        return database.query(
            //language=aql
            """
				FOR route IN ${DbCollections.ROUTES}
					FILTER route._documentType != "reservation"
					FILTER route.gameId == @gameId
					RETURN route
			""".trimIndent(),
            mapOf("gameId" to gameId.value),
            RouteEntity::class.java
        ).map { it.asServiceModel() }
    }

}

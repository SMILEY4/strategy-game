package io.github.smiley4.strategygame.backend.sessions.application.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.parallelIO
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.GameEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.RealmEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.TileEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectEntity
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectEntityCollection.Companion.toTypedCollection
import kotlin.collections.map

internal class GameStateUpdate(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(GameStateUpdate::class)

    suspend fun execute(gameState: GameState) {
        return time(metricId) {
            val gameId = gameState.game.id.value
            updateGame(gameState.game)
            parallelIO(
                { updateTiles(gameState.tiles, gameId) },
                { updateRealms(gameState.realms, gameId) },
                { deleteRealms(gameState.realms.getRemovedElements(), gameId) },
                { updateWorldObjects(gameState.worldObjects, gameId) },
                { deleteWorldObjects(gameState.worldObjects.getRemovedElements(), gameId) }
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
        database.insertOrReplaceDocuments(DbCollections.WORLD_OBJECTS, worldObjects.map { WorldObjectEntity.of(it, gameId) }.toTypedCollection())
    }

    private suspend fun deleteWorldObjects(worldObjects: Set<WorldObject>, gameId: String) {
        database.deleteDocuments(DbCollections.WORLD_OBJECTS, worldObjects.map { WorldObjectEntity.of(it, gameId) }.map { it.getKeyOrThrow() })
    }

}
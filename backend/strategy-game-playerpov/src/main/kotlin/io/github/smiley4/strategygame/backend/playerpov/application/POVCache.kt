package io.github.smiley4.strategygame.backend.playerpov.application

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.playerpov.VisibilityCalculator


internal class POVCache(
    gameState: GameState,
    visibilityCalculator: VisibilityCalculator,
    povRealm: Realm.Id
) {

    // json-objects for all identifiers in the game
    private val realmIdentifiers = mutableMapOf<Realm.Id, JsonType>()
    private val tileIdentifiers = mutableMapOf<Tile.Id, JsonType>()


    // visibility states for all things
    private val tileVisibilities = mutableMapOf<Tile.Id, TileVisibilityDTO>()
    private val worldObjectVisibilities = mutableMapOf<WorldObject.Id, TileVisibilityDTO>()

    init {

        // build json-identifiers for all things in the game
        gameState.realms.forEach { realm ->
            realmIdentifiers[realm.id] = obj {
                "id" to realm.id.value
                "name" to realm.id.value
            }
        }
        gameState.tiles.forEach { tile ->
            tileIdentifiers[tile.id] = obj {
                "id" to tile.id.value
                "q" to tile.position.q
                "r" to tile.position.r
            }
        }

        // calculate visibility state for all tiles
        gameState.tiles.forEach { tile ->
            tileVisibilities[tile.id] = visibilityCalculator.calculate(gameState, povRealm, tile)
        }

        // calculate visible world objects
        gameState.worldObjects.forEach { worldObject ->
            worldObjectVisibilities[worldObject.id] =
                if (tileVisibility(worldObject.tile.id).isAtLeast(TileVisibilityDTO.VISIBLE)) TileVisibilityDTO.VISIBLE
                else TileVisibilityDTO.UNKNOWN
        }
    }

    fun realmIdentifier(id: Realm.Id): JsonType =
        realmIdentifiers[id] ?: throw Exception("No realm identifier for $id")

    fun tileIdentifier(tileId: Tile.Id): JsonType =
        tileIdentifiers[tileId] ?: throw Exception("No tile identifier for $tileId")

    fun tileVisibility(tileId: Tile.Id): TileVisibilityDTO =
        tileVisibilities[tileId] ?: throw Exception("No visibility for tile $tileId")

    fun worldObjectVisibility(worldObjectId: WorldObject.Id): TileVisibilityDTO =
        worldObjectVisibilities[worldObjectId] ?: throw Exception("No visibility for world-object $worldObjectId")
}
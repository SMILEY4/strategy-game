package io.github.smiley4.strategygame.backend.playerpov.application

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Tile


internal class TilePOVBuilder(private val povCache: POVCache) {

    fun build(tile: Tile): JsonType {
        val visibility = povCache.tileVisibility(tile.id)
        return obj {
            "identifier" to obj {
                "id" to tile.id.value
                "q" to tile.position.q
                "r" to tile.position.r
            }
            "visibility" to visibility
            "base" to hidden(visibility.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                obj {
                    "terrainType" to tile.dataWorld.terrainType
                    "resourceType" to tile.dataWorld.resourceType
                    "height" to tile.dataWorld.height
                }
            }
        }
    }

}
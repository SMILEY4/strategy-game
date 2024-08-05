package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Tile


internal class TilePOVBuilder(private val povCache: POVCache) {

    fun build(tile: Tile): JsonType {
        val visibility = povCache.tileVisibility(tile.tileId)
        return obj {
            "identifier" to obj {
                "id" to tile.tileId
                "q" to tile.position.q
                "r" to tile.position.r
            }
            "visibility" to visibility
            "base" to objHidden(visibility.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                obj {
                    "terrainType" to tile.data.terrainType
                    "resourceType" to tile.data.resourceType
                    "height" to tile.data.height
                }
            }
        }.also {
            try {
                it.toPrettyJsonString()
            } catch (e: Exception) {
                println("failed printing")
            }
        }
    }

}
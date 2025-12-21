package io.github.smiley4.strategygame.backend.playerpov.application.builders

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.playerpov.application.POVCache
import io.github.smiley4.strategygame.backend.playerpov.application.TileVisibilityDTO
import io.github.smiley4.strategygame.backend.playerpov.application.hidden
import io.github.smiley4.strategygame.backend.playerpov.application.isAtLeast


internal class TilePOVBuilder(private val povCache: POVCache) {

    fun build(tile: Tile): JsonType {
        val visibility = povCache.tileVisibility(tile.id)
        return obj {
            "identifier" to povCache.tileIdentifier(tile.id)
            "visibility" to visibility
            "base" to hidden(visibility.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                obj {
                    "terrainType" to tile.dataWorld.terrainType
                    "height" to tile.dataWorld.height
                    "resources" to tile.dataWorld.resources.map { resourceNode ->
                        obj {
                            "type" to resourceNode.type.name
                            "amount" to resourceNode.amount
                            "maxAmount" to resourceNode.maxAmount
                            "changeRate" to resourceNode.changeRate
                            "canDeplete" to resourceNode.canDeplete
                        }
                    }
                }
            }
            "metaProperties" to obj {
                "seed" to tile.metaProperties.seed
            }
        }
    }

}
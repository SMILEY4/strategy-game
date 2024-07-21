package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Tile


internal class TilePOVBuilder {

    fun build(tile: Tile): JsonType {
        return obj {
            "identifier" to obj {
                "id" to tile.tileId
                "q" to tile.position.q
                "r" to tile.position.r
            }
            "terrainType" to tile.data.terrainType
            "resourceType" to tile.data.resourceType
            "height" to tile.data.height
        }
    }

}
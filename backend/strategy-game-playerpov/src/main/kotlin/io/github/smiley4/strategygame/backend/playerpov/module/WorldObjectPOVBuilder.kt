package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.WorldObject


internal class WorldObjectPOVBuilder(private val povCache: POVCache) {

    fun build(worldObject: WorldObject): JsonType? {
        if (povCache.worldObjectVisibility(worldObject.id).isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return null
        }
        return when (worldObject) {
            is WorldObject.Scout -> obj {
                "type" to "scout"
                "id" to worldObject.id.value
                "country" to worldObject.country.value
                "tile" to obj {
                    "id" to worldObject.tile.id.value
                    "q" to worldObject.tile.q
                    "r" to worldObject.tile.r
                }
                "maxMovement" to worldObject.maxMovement
            }
            is WorldObject.Settler -> obj {
                "type" to "settler"
                "id" to worldObject.id.value
                "country" to worldObject.country.value
                "tile" to obj {
                    "id" to worldObject.tile.id.value
                    "q" to worldObject.tile.q
                    "r" to worldObject.tile.r
                }
                "maxMovement" to worldObject.maxMovement
            }
        }
    }

}
package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ScoutWorldObject
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject


internal class WorldObjectPOVBuilder {

    fun build(worldObject: WorldObject): JsonType {
        return when(worldObject) {
            is ScoutWorldObject -> obj {
                "type" to "scout"
                "id" to worldObject.id
                "tile" to obj {
                    "id" to worldObject.tile.id
                    "q" to worldObject.tile.q
                    "r" to worldObject.tile.r
                }
                "country" to worldObject.country
            }
        }
    }

}
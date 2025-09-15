package io.github.smiley4.strategygame.backend.playerpov.application.builders

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import io.github.smiley4.strategygame.backend.playerpov.application.POVCache
import io.github.smiley4.strategygame.backend.playerpov.application.TileVisibilityDTO
import io.github.smiley4.strategygame.backend.playerpov.application.isLessThan


internal class  WorldObjectPOVBuilder(private val povCache: POVCache) {

    fun build(worldObject: WorldObject): JsonType? {
        if(povCache.worldObjectVisibility(worldObject.id).isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return null
        }
        return obj {
            "id" to worldObject.id.value
            "type" to worldObject.type
            "realm" to povCache.realmIdentifier(worldObject.realmId)
            "tile" to povCache.tileIdentifier(worldObject.tile.id)
            "components" to worldObject.components.map { component ->
                when(component) {
                    is WorldObjectComponent.Movement -> obj {
                        "type" to "movement"
                        "maxMovement" to component.maxMovement
                    }
                    is WorldObjectComponent.Vision -> obj {
                        "type" to "vision"
                        "radius" to component.radius
                    }
                }
            }
        }
    }

}
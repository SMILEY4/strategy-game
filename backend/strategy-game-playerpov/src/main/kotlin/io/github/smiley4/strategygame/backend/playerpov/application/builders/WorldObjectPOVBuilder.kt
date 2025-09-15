package io.github.smiley4.strategygame.backend.playerpov.application.builders

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent


internal class  WorldObjectPOVBuilder {

    fun build(worldObject: WorldObject): JsonType {
        return obj {
            "id" to worldObject.id.value
            "type" to worldObject.type
            "realm" to worldObject.realmId.value
            "tile" to obj {
                "id" to worldObject.tile.id.value
                "q" to worldObject.tile.position.q
                "r" to worldObject.tile.position.r
            }
            "components" to worldObject.components.map { component ->
                when(component) {
                    is WorldObjectComponent.Movement -> obj {
                        "type" to "movement"
                        "maxMovement" to component.maxMovement
                    }
                    is WorldObjectComponent.Vision -> obj {
                        "type" to "vision"
                        "maxVisionDistance" to component.maxVisionDistance
                    }
                }
            }
        }
    }

}
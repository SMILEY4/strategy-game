package io.github.smiley4.strategygame.backend.engine.application.core.tools

import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent

internal object Tools {

    fun discoverArea(gameState: GameState, worldObject: WorldObject) {
        val visionComponent = worldObject.getComponentOrNull<WorldObjectComponent.Vision>()
        if (visionComponent != null) {
            positionsCircle(worldObject.tile, visionComponent.radius) { q, r ->
                gameState.tiles.get(q, r)?.also { tile ->
                    tile.discoveredBy.add(worldObject.realmId)
                }
            }
        }
    }

}
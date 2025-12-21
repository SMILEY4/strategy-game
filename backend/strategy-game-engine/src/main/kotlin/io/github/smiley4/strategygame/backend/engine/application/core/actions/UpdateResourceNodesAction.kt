package io.github.smiley4.strategygame.backend.engine.application.core.actions

import io.github.smiley4.strategygame.backend.commondata.GameState
import kotlin.math.min

class UpdateResourceNodesAction {

    fun onWorldUpdate(gameState: GameState) {
        gameState.tiles.forEach { tile ->
            tile.dataWorld.resources.removeIf { resourceNode ->
                resourceNode.amount += resourceNode.changeRate
                resourceNode.amount = min(resourceNode.amount, resourceNode.maxAmount)
                resourceNode.canDeplete && resourceNode.amount <= 0
            }
        }
    }

}
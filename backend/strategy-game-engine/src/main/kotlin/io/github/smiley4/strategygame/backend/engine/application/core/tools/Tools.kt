package io.github.smiley4.strategygame.backend.engine.application.core.tools

import io.github.smiley4.strategygame.backend.common.utils.getNeighbourPositions
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent

internal object Tools {

    /**
     * Mark the area of the given world object as discovered for the owner realm (based on [WorldObjectComponent.Vision])
     */
    fun discoverArea(gameState: GameState, worldObject: WorldObject) {
        val visionComponent = worldObject.getComponentOrNull<WorldObjectComponent.Vision>()
        if (visionComponent != null) {
            positionsCircle(worldObject.tile, visionComponent.radius) { q, r ->
                gameState.tiles.get(q, r)?.also { tile ->
                    tile.discoveredBy.add(worldObject.realm)
                }
            }
        }
    }

    /**
     * Get all available next move targets for the given world object at the given [tile] and already aggregated movement cost [currentPoints].
     */
    fun getValidMovementTargets(
        gameState: GameState,
        worldObject: WorldObject,
        tile: Tile.Ref,
        currentPoints: Int,
        respectPoV: Boolean, // todo: remove ?
    ): List<MovementTarget> {
        val movementComponent = worldObject.getComponentOrNull<WorldObjectComponent.Movement>() ?: return listOf()
        return getNeighbourPositions(tile)
            .mapNotNull { gameState.tiles.get(it.first, it.second) }
            .filter {
                if (respectPoV && !it.discoveredBy.contains(worldObject.realm)) {
                    true
                } else {
                    it.dataWorld.terrainType == TerrainType.LAND
                }
            }
            .map { MovementTarget(tile = it.ref(), cost = 1) }
            .filter { currentPoints + it.cost <= movementComponent.maxMovement }
    }

}
package io.github.smiley4.strategygame.backend.engine.application.core

import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.engine.application.core.tools.Tools
import io.github.smiley4.strategygame.backend.engine.ports.provided.GenericGameService

class GenericGameServiceImpl : GenericGameService {

    override fun getAvailablePositions(
        gameState: GameState,
        worldObject: WorldObject,
        tile: Tile.Ref,
        currentPoints: Int,
        respectPoV: Boolean
    ): List<MovementTarget> {
        return Tools.getValidMovementTargets(gameState, worldObject, tile, currentPoints, respectPoV)
    }

}
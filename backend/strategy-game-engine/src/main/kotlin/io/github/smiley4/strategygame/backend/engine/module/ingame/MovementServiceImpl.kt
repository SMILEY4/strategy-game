package io.github.smiley4.strategygame.backend.engine.module.ingame

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.getNeighbourPositions
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.MovementService

class MovementServiceImpl : MovementService, Logging {

    override fun getAvailablePositions(
        game: GameExtended,
        worldObject: WorldObject,
        tile: TileRef,
        currentPoints: Int
    ): List<MovementTarget> {
        return getNeighbourPositions(tile)
            .mapNotNull { game.findTileOrNull(it.first, it.second) }
            .map { MovementTarget( tile = it.ref(), cost = 1) }
            .filter { currentPoints + it.cost <= worldObject.maxMovement }
    }

}
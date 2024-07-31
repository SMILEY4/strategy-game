package io.github.smiley4.strategygame.backend.engine.module.ingame

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.getNeighbourPositions
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.MovementService

class MovementServiceImpl : MovementService, Logging {

    override fun getAvailablePositions(game: GameExtended, worldObject: WorldObject, tile: Tile): List<TileRef> {
        return getNeighbourPositions(tile.position)
            .mapNotNull { game.findTileOrNull(it.first, it.second) }
            .map { it.ref() }
    }

}
package io.github.smiley4.strategygame.backend.engine.module

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.getNeighbourPositions
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.PublicApiService

class PublicApiServiceImpl : PublicApiService, Logging {

    override fun getAvailableMovementPositions(game: GameExtended, worldObject: WorldObject, tile: Tile): List<TileRef> {
        return getNeighbourPositions(tile.position)
            .mapNotNull { game.findTileOrNull(it.first, it.second) }
            .map { it.ref() }
            .also { log().debug("Found ${it.size} available movement destinations.") }
    }

}
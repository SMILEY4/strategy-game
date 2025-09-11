package io.github.smiley4.strategygame.backend.engine.application.core.ingame

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.getNeighbourPositions
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.ports.provided.MovementService

class MovementServiceImpl : MovementService, Logging {

    override fun getAvailablePositions(
        game: GameExtended,
        worldObject: WorldObject,
        tile: TileRef,
        currentPoints: Int,
        respectPoV: Boolean,
    ): List<MovementTarget> {
        return getNeighbourPositions(tile)
            .mapNotNull { game.findTileOrNull(it.first, it.second) }
            .filter {
                if (respectPoV && !it.dataPolitical.discoveredByCountries.contains(worldObject.country)) {
                    true
                } else {
                    it.dataWorld.terrainType == TerrainType.LAND
                }
            }
            .map { MovementTarget( tile = it.ref(), cost = 1) }
            .filter { currentPoints + it.cost <= worldObject.maxMovement }
    }

}
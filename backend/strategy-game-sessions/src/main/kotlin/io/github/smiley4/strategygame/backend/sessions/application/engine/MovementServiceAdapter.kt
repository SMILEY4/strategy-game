package io.github.smiley4.strategygame.backend.sessions.application.engine

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.sessions.ports.required.MovementService

internal class MovementServiceAdapter(
    private val engineService: io.github.smiley4.strategygame.backend.engine.edge.MovementService
) : MovementService {

    override fun getAvailablePositions(
        game: GameExtended,
        worldObject: WorldObject,
        tile: TileRef,
        currentPoints: Int
    ): List<MovementTarget> {
        return engineService.getAvailablePositions(game, worldObject, tile, currentPoints)
    }

}
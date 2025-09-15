package io.github.smiley4.strategygame.backend.sessions.application.engine

import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.sessions.ports.required.GenericGameService

import io.github.smiley4.strategygame.backend.engine.ports.provided.GenericGameService as EngineGenericGameService


class GenericGameServiceAdapter(private val impl: EngineGenericGameService) : GenericGameService {

    override fun getAvailablePositions(
        gameState: GameState,
        worldObject: WorldObject,
        tile: Tile.Ref,
        currentPoints: Int,
        respectPoV: Boolean
    ): List<MovementTarget> {
        return impl.getAvailablePositions(gameState, worldObject, tile, currentPoints, respectPoV)
    }

}
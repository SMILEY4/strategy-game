package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.WorldObject

interface MovementService {
    /**
     * Get the tiles that the given world object can move to
     * @param game the game state
     * @param worldObject the world object that wants to move
     * @param tile the current position of the world object. May be different from [WorldObject.tile], e.g. if it is mid-movement
     * @param currentPoints the already used movement points of the world object to get to its current position
     * @return the list of available tiles to move to and how much it would cost
     */
    fun getAvailablePositions(game: GameExtended, worldObject: WorldObject, tile: TileRef, currentPoints: Int): List<MovementTarget>
}
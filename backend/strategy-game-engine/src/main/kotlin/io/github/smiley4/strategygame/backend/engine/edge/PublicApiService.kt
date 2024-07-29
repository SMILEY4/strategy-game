package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.WorldObject

interface PublicApiService {
    fun getAvailableMovementPositions(game: GameExtended, worldObject: WorldObject, tile: Tile): List<TileRef>
}
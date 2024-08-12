package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile

interface GameValidations {
    fun validateSettlementName(name: String)
    fun validateSettlementLocation(game: GameExtended, tile: Tile)
}
package io.github.smiley4.strategygame.backend.engine.module.tools

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.engine.edge.GameValidations

internal class GameValidationsImpl : GameValidations {

    override fun validateSettlementName(name: String) {
        // empty name
        if(name.isBlank()) {
            throw Exception("Validation: settlement name may not be blank")
        }
    }

    override fun validateSettlementLocation(game: GameExtended, tile: Tile) {
        // invalid terrain type
        if(tile.data.terrainType != TerrainType.LAND) {
            throw Exception("Validation: settlement may not be placed on '${tile.data.terrainType}' tiles")
        }
        // tile already occupied
        if(game.settlements.any { it.tile.id == tile.tileId }) {
            throw Exception("Validation: settlement may not be placed on already occupied tiles")
        }
    }

}

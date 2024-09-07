package io.github.smiley4.strategygame.backend.engine.module.tools

import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.engine.edge.GameValidations

internal class GameValidationsImpl : GameValidations {

    override fun validateSettlementSettler(worldObject: WorldObject) {
        // world object must be settler
        if(worldObject !is WorldObject.Settler) {
            throw Exception("Validation: world object must be of type settler to create settlement")
        }
    }

    override fun validateSettlementName(name: String) {
        // empty name
        if(name.isBlank()) {
            throw Exception("Validation: settlement name may not be blank")
        }
    }

    override fun validateSettlementLocationSettler(game: GameExtended, tile: Tile, countryId: Country.Id) {
        validateSettlementLocation(game, tile)
        // invalid tile owner
        if(tile.dataPolitical.controlledBy != null) {
            throw Exception("Validation: settlement may not be placed on tile owned by any country")
        }
    }

    override fun validateSettlementLocationDirect(game: GameExtended, tile: Tile, countryId: Country.Id) {
        validateSettlementLocation(game, tile)
        // invalid tile owner
        if(tile.dataPolitical.controlledBy == null || tile.dataPolitical.controlledBy?.country != countryId) {
            throw Exception("Validation: settlement may not be placed on tile not owned by country")
        }
    }

    private fun validateSettlementLocation(game: GameExtended, tile: Tile) {
        // invalid terrain type
        if(tile.dataWorld.terrainType != TerrainType.LAND) {
            throw Exception("Validation: settlement may not be placed on '${tile.dataWorld.terrainType}' tiles")
        }
        // tile already occupied
        if(game.settlements.any { it.tile.id == tile.id }) {
            throw Exception("Validation: settlement may not be placed on already occupied tiles")
        }
    }

}

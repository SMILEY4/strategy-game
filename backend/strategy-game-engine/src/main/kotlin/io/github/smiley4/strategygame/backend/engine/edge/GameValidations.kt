package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject

interface GameValidations {
    fun validateSettlementSettler(worldObject: WorldObject)
    fun validateSettlementName(name: String)
    fun validateSettlementLocationSettler(game: GameExtended, tile: Tile, countryId: Country.Id)
    fun validateSettlementLocationDirect(game: GameExtended, tile: Tile, countryId: Country.Id)
}
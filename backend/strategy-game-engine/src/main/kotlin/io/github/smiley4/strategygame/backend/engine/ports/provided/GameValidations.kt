package io.github.smiley4.strategygame.backend.engine.ports.provided

import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject

interface GameValidations {
    fun validateSettler(worldObject: WorldObject)
    fun validateSettlementName(name: String)
    fun validateSettlementLocation(game: GameExtended, tile: Tile, countryId: Country.Id)
}
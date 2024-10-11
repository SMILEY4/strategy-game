package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Tile

interface SettlementUtilities {
    fun getPossibleWorkTiles(game: GameExtended, settlement: Settlement, buildingType: BuildingType): Sequence<Tile>
}
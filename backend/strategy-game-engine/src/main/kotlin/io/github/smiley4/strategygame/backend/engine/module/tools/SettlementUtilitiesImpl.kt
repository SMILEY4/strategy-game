package io.github.smiley4.strategygame.backend.engine.module.tools

import io.github.smiley4.strategygame.backend.common.utils.getNeighbourPositions
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.checkTile
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.SettlementUtilities

internal class SettlementUtilitiesImpl : SettlementUtilities {
    override fun getPossibleWorkTiles(game: GameExtended, settlement: Settlement, buildingType: BuildingType): Sequence<Tile> {
        return getNeighbourPositions(settlement.tile)
            .asSequence()
            .mapNotNull { (q, r) -> game.findTileOrNull(q, r) }
            .filter { it.dataPolitical.controlledBy?.settlement == settlement.id }
            .filter { buildingType.templateData.checkTile(it) }
            .filter { settlement.infrastructure.buildings.mapNotNull { it.workedTile }.none { other -> other == it.ref() } }
    }
}
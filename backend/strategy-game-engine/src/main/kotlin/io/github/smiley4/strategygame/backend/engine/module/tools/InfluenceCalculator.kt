package io.github.smiley4.strategygame.backend.engine.module.tools

import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileInfluence

internal class InfluenceCalculator {

    fun calculate(game: GameExtended, tile: Tile): List<TileInfluence> {
        return game.settlements.mapNotNull { calculate(game, tile, it) }
    }

    private fun calculate(game: GameExtended, tile: Tile, settlement: Settlement): TileInfluence? {
        val maxInfluence = 10.0
        val spreadDistance = 4.0

        val distance = tile.position.distance(settlement.tile).toDouble()
        val influence = (1.0 - (distance / spreadDistance)) * maxInfluence

        return if (influence > 0) {
            TileInfluence(
                countryId = settlement.countryId,
                provinceId = settlement.findProvince(game).provinceId,
                settlementId = settlement.settlementId,
                amount = influence
            )
        } else {
            null
        }
    }

}
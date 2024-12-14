package io.github.smiley4.strategygame.backend.engine.application.core.tools

import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Tile

internal class InfluenceCalculator {

    fun calculate(game: GameExtended, tile: Tile): List<Tile.Influence> {
        return game.settlements.mapNotNull { calculate(tile, it) }
    }

    private fun calculate(tile: Tile, settlement: Settlement): Tile.Influence? {
        val maxInfluence = 10.0
        val spreadDistance = 4.0

        val distance = tile.position.distance(settlement.tile).toDouble()
        val influence = (1.0 - (distance / spreadDistance)) * maxInfluence

        return if (influence > 0) {
            Tile.Influence(
                country = settlement.country,
                settlement = settlement.id,
                amount = influence
            )
        } else {
            null
        }
    }

}
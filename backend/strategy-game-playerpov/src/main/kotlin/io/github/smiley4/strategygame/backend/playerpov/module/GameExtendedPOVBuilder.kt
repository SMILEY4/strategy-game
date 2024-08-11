package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.engine.edge.GameValidations


internal class GameExtendedPOVBuilder(private val gameValidations: GameValidations) {

    private val metricId = MetricId.action(GameExtendedPOVBuilder::class)

    fun create(userId: String, game: GameExtended): JsonType {
        return time(metricId) {

            val playerCountry = game.findCountryByUser(userId)
            val povCache = POVCache(game, playerCountry.countryId, TileVisibilityCalculator())

            val tileBuilder = TilePOVBuilder(povCache)
            val worldObjectBuilder = WorldObjectPOVBuilder(povCache, gameValidations)
            val countryBuilder = CountryPOVBuilder()
            val settlementBuilder = SettlementPOVBuilder(povCache)

            obj {
                "meta" to obj {
                    "turn" to game.meta.turn
                }
                "tiles" to game.tiles.mapNotNull { tileBuilder.build(it) }
                "countries" to game.countries.map { countryBuilder.build(it, userId) }
                "worldObjects" to game.worldObjects.mapNotNull { worldObjectBuilder.build(game, it) }
                "settlements" to game.settlements.mapNotNull { settlementBuilder.build(it) }
            }
        }
    }

}

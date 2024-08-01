package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.GameExtended


internal class GameExtendedPOVBuilder {

    private val metricId = MetricId.action(GameExtendedPOVBuilder::class)

    fun create(game: GameExtended): JsonType {
        return time(metricId) {

            val tileBuilder = TilePOVBuilder()
            val worldObjectBuilder = WorldObjectPOVBuilder()
            val countryBuilder = CountryPOVBuilder()

            obj {
                "meta" to obj {
                    "turn" to game.meta.turn
                }
                "tiles" to game.tiles.mapNotNull { tileBuilder.build(it) }
                "countries" to game.countries.map { countryBuilder.build(it) }
                "worldObjects" to game.worldObjects.map { worldObjectBuilder.build(it) }
            }
        }
    }

}

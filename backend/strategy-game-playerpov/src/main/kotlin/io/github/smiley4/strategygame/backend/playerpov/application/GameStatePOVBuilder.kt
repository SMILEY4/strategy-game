package io.github.smiley4.strategygame.backend.playerpov.application

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.User


internal class GameStatePOVBuilder {

    private val metricId = MetricId.action(GameStatePOVBuilder::class)

    fun create(userId: User.Id, gameState: GameState): JsonType {
        return time(metricId) {

            val playerRealm = gameState.realms.find { it.user == userId }!!
            val povCache = POVCache(gameState)

            val tileBuilder = TilePOVBuilder(povCache)
            val realmBuilder = RealmPOVBuilder()

            obj {
                "meta" to obj {
                    "turn" to gameState.game.turn
                }
                "tiles" to gameState.tiles.mapNotNull { tileBuilder.build(it) }
                "realms" to gameState.realms.map { realmBuilder.build(it, userId) }
                "worldObjects" to listOf<JsonType>()
            }
        }
    }

}

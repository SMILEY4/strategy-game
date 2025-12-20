package io.github.smiley4.strategygame.backend.playerpov.application

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.playerpov.VisibilityCalculator
import io.github.smiley4.strategygame.backend.playerpov.application.builders.RealmPOVBuilder
import io.github.smiley4.strategygame.backend.playerpov.application.builders.RoutePovBuilder
import io.github.smiley4.strategygame.backend.playerpov.application.builders.TilePOVBuilder
import io.github.smiley4.strategygame.backend.playerpov.application.builders.WorldObjectPOVBuilder
import io.github.smiley4.strategygame.backend.playerpov.lib.PlayerViewCreator


internal class PlayerViewCreatorImpl(private val visibilityCalculator: VisibilityCalculator) : PlayerViewCreator {

    private val metricId = MetricId.action(PlayerViewCreatorImpl::class)

    override fun build(userId: User.Id, gameState: GameState): JsonType {
        return time(metricId) {

            val povRealm = gameState.realms.find { it.user == userId }!!
            val povCache = POVCache(gameState, visibilityCalculator, povRealm.id)

            val tileBuilder = TilePOVBuilder(povCache)
            val realmBuilder = RealmPOVBuilder()
            val worldObjectBuilder = WorldObjectPOVBuilder(povCache)
            val routeBuilder = RoutePovBuilder(povCache)

            obj {
                "game" to obj {
                    "turn" to gameState.game.turn
                }
                "tiles" to gameState.tiles.map { tileBuilder.build(it) }
                "realms" to gameState.realms.map { realmBuilder.build(it, userId) }
                "worldObjects" to gameState.worldObjects.mapNotNull { worldObjectBuilder.build(it) }
                "routes" to gameState.routes.mapNotNull { routeBuilder.build(it) }
            }
        }
    }

}
package io.github.smiley4.strategygame.backend.engine.module

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.Id
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.RGBColor
import io.github.smiley4.strategygame.backend.commondata.ScoutWorldObject
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer


internal class InitializePlayerImpl : InitializePlayer {

    private val metricId = MetricId.action(InitializePlayer::class)

    override suspend fun perform(game: GameExtended, userId: String, color: RGBColor) {
        return time(metricId) {
            initScout(game)
        }
    }

    private fun initScout(game: GameExtended) {
        game.worldObjects.add(
            ScoutWorldObject(
                id = Id.gen(),
                tile = game.tiles.random().ref()
            )
        )
    }

}
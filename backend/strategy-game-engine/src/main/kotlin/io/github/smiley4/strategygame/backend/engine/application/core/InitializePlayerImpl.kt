package io.github.smiley4.strategygame.backend.engine.application.core

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer


internal class InitializePlayerImpl() : InitializePlayer {

    private val metricId = MetricId.action(InitializePlayer::class)

    override suspend fun perform(game: GameState, userId: User.Id) {
        return time(metricId) {
            initRealm(game, userId)
        }
    }

    private fun initRealm(game: GameState, userId: User.Id) {
        game.realms.add(
            Realm(
                id = Realm.Id.gen(),
                user = userId,
            )
        )
    }

}
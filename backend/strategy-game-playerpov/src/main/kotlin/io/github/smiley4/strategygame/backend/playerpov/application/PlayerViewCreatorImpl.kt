package io.github.smiley4.strategygame.backend.playerpov.application

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.playerpov.lib.PlayerViewCreator


internal class PlayerViewCreatorImpl : PlayerViewCreator {

    override fun build(userId: User.Id, game: GameState): JsonType {
        return GameStatePOVBuilder().create(userId, game)
    }

}
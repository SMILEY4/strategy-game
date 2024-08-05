package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.playerpov.edge.PlayerViewCreator


internal class PlayerViewCreatorImpl : PlayerViewCreator {

    override fun build(userId: String, game: GameExtended): JsonType {
        return GameExtendedPOVBuilder().create(userId, game)
    }

}
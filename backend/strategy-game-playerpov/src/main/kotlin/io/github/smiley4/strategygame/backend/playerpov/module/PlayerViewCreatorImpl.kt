package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.playerpov.edge.PlayerViewCreator


internal class  PlayerViewCreatorImpl(private val gameConfig: GameConfig) : PlayerViewCreator {

    override fun build(userId: String, game: GameExtended): JsonType {
        return GameExtendedPOVBuilder(gameConfig).create(userId, game)
    }

}
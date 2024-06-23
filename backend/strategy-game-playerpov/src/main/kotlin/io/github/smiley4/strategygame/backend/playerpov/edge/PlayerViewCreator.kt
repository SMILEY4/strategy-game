package io.github.smiley4.strategygame.backend.playerpov.edge

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.commondata.GameExtended

interface PlayerViewCreator {
    fun build(userId: String, game: GameExtended): JsonType
}
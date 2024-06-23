package io.github.smiley4.strategygame.backend.playerpov.edge

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType

// todo: move to engine
interface PlayerViewCreator {
    fun build(userId: String, gameId: String): JsonType
}
package io.github.smiley4.strategygame.backend.worlds.edge

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType

interface GameMessageProducer {
    suspend fun sendGameState(connectionId: Long, gameState: JsonType)
}
package io.github.smiley4.strategygame.backend.sessions.events

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.websocket.messages.MessageProducer


class GameEventProducer(private val producer: MessageProducer) {

    suspend fun sendGameState(connectionId: Long, gameState: JsonType) {
        producer.sendToSingle(
            connectionId,
            GameStateMessage(GameStateMessage.Companion.GameStatePayload(gameState))
        )
    }
}
package io.github.smiley4.strategygame.backend.gateway.sessions

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.gateway.websocket.messages.MessageProducer
import io.github.smiley4.strategygame.backend.gateway.sessions.models.GameStateMessage
import io.github.smiley4.strategygame.backend.sessions.ports.provided.GameMessageProducer

internal class GatewayGameMessageProducer(private val producer: MessageProducer) : GameMessageProducer {

    override suspend fun sendGameState(connectionId: Long, gameState: JsonType) {
        producer.sendToSingle(
            connectionId,
            GameStateMessage(GameStateMessage.Companion.GameStatePayload(gameState))
        )
    }

}
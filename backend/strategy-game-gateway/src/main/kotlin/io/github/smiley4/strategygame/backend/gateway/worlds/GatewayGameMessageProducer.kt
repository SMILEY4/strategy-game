package io.github.smiley4.strategygame.backend.gateway.worlds

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.gateway.websocket.messages.MessageProducer
import io.github.smiley4.strategygame.backend.gateway.worlds.models.GameStateMessage
import io.github.smiley4.strategygame.backend.worlds.edge.GameMessageProducer

internal class GatewayGameMessageProducer(private val producer: MessageProducer) : GameMessageProducer {

    override suspend fun sendGameState(connectionId: Long, gameState: JsonType) {
        producer.sendToSingle(
            connectionId,
            GameStateMessage(GameStateMessage.Companion.GameStatePayload(gameState))
        )
    }

}
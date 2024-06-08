package io.github.smiley4.strategygame.backend.worlds.external.message.producer

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.worlds.external.message.models.GameStateMessage
import io.github.smiley4.strategygame.backend.worlds.external.message.websocket.MessageProducer

class GameMessageProducerImpl(private val producer: MessageProducer) : GameMessageProducer {

    override suspend fun sendGamedState(connectionId: Long, game: JsonType) {
        producer.sendToSingle(
            connectionId,
            GameStateMessage(GameStateMessage.Companion.GameStatePayload(game))
        )
    }

}
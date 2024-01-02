package de.ruegnerlukas.strategygame.backend.gamesession.external.message.producer

import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.GameStateMessage
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.GameStateMessage.Companion.GameStatePayload
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.websocket.MessageProducer

class GameMessageProducerImpl(private val producer: MessageProducer) : GameMessageProducer {

    override suspend fun sendGamedState(connectionId: Long, game: JsonType) {
        producer.sendToSingle(
            connectionId,
            GameStateMessage(GameStatePayload(game))
        )
    }

}
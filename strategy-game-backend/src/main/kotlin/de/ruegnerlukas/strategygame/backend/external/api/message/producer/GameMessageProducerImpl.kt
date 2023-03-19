package de.ruegnerlukas.strategygame.backend.external.api.message.producer

import de.ruegnerlukas.strategygame.backend.external.api.message.models.GameStateMessage
import de.ruegnerlukas.strategygame.backend.external.api.message.models.GameStateMessage.Companion.GameStatePayload
import de.ruegnerlukas.strategygame.backend.external.api.message.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer

class GameMessageProducerImpl(private val producer: MessageProducer) : GameMessageProducer {

    override suspend fun sendGamedState(connectionId: Int, game: GameExtendedDTO) {
        producer.sendToSingle(
            connectionId,
            GameStateMessage(GameStatePayload(game))
        )
    }

}
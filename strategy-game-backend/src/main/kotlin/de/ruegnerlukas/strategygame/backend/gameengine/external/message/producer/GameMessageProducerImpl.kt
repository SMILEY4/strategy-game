package de.ruegnerlukas.strategygame.backend.gameengine.external.message.producer

import de.ruegnerlukas.strategygame.backend.gameengine.external.message.models.GameStateMessage
import de.ruegnerlukas.strategygame.backend.gameengine.external.message.models.GameStateMessage.Companion.GameStatePayload
import de.ruegnerlukas.strategygame.backend.gameengine.external.message.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.common.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.common.models.dtos.GameExtendedDTO

class GameMessageProducerImpl(private val producer: MessageProducer) : GameMessageProducer {

    override suspend fun sendGamedState(connectionId: Long, game: GameExtendedDTO) {
        producer.sendToSingle(
            connectionId,
            GameStateMessage(GameStatePayload(game))
        )
    }

}
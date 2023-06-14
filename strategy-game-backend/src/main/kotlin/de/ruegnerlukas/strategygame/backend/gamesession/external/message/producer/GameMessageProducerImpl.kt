package de.ruegnerlukas.strategygame.backend.gamesession.external.message.producer

import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.GameStateMessage
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.GameStateMessage.Companion.GameStatePayload
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos.GameExtendedDTO

class GameMessageProducerImpl(private val producer: MessageProducer) : GameMessageProducer {

    override suspend fun sendGamedState(connectionId: Long, game: GameExtendedDTO) {
        producer.sendToSingle(
            connectionId,
            GameStateMessage(GameStatePayload(game))
        )
    }

}
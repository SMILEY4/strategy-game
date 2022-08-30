package de.ruegnerlukas.strategygame.backend.external.api.message.producer

import de.ruegnerlukas.strategygame.backend.external.api.message.models.GameStateMessage
import de.ruegnerlukas.strategygame.backend.external.api.message.models.GameStateMessage.Companion.GameStatePayload
import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer

class GameMessageProducerImpl(private val producer: MessageProducer) : GameMessageProducer {

    override suspend fun sendGamedState(connectionId: Int, game: GameExtendedEntity) {
        producer.sendToSingle(
            connectionId,
            GameStateMessage(GameStatePayload(GameExtendedDTO(game)))
        )
    }

}
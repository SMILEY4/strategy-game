package de.ruegnerlukas.strategygame.backend.external.api.message.producer

import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.shared.Json

class GameMessageProducerImpl(private val producer: MessageProducer) : GameMessageProducer {

	override suspend fun sendWorldState(connectionId: Int, message: WorldStateMessage) {
		producer.sendToSingle(connectionId, "world-state", Json.asString(message))
	}

	override suspend fun sendWorldState(connectionIds: List<Int>, message: WorldStateMessage) {
		producer.sendToMultiple(connectionIds, "world-state", Json.asString(message))
	}

}
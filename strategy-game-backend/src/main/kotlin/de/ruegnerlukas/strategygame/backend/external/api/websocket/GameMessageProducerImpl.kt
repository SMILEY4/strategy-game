package de.ruegnerlukas.strategygame.backend.external.api.websocket

import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class GameMessageProducerImpl(private val producer: MessageProducer) : GameMessageProducer {

	override suspend fun sendWorldState(connectionId: Int, message: WorldStateMessage) {
		producer.sendToSingle(connectionId, "world-state", Json.encodeToString(message))
	}

	override suspend fun sendWorldState(connectionIds: List<Int>, message: WorldStateMessage) {
		producer.sendToMultiple(connectionIds, "world-state", Json.encodeToString(message))
	}

}
package de.ruegnerlukas.strategygame.backend.external.api.message.producer

import de.ruegnerlukas.strategygame.backend.external.api.message.models.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.external.api.message.models.WorldStateMessage.Companion.WorldStatePayload
import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer

class GameMessageProducerImpl(private val producer: MessageProducer) : GameMessageProducer {

	override suspend fun sendWorldState(connectionId: Int, game: GameExtendedEntity) {
		producer.sendToSingle(connectionId, WorldStateMessage(WorldStatePayload(game)))
	}

}
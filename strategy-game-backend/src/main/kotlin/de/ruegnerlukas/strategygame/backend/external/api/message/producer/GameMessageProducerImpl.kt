package de.ruegnerlukas.strategygame.backend.external.api.message.producer

import de.ruegnerlukas.strategygame.backend.external.api.message.models.TurnResultMessage
import de.ruegnerlukas.strategygame.backend.external.api.message.models.TurnResultMessage.Companion.TurnResultPayload
import de.ruegnerlukas.strategygame.backend.external.api.message.models.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.external.api.message.models.WorldStateMessage.Companion.WorldStatePayload
import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CommandResolutionErrorDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer

class GameMessageProducerImpl(private val producer: MessageProducer) : GameMessageProducer {

	override suspend fun sendWorldState(connectionId: Int, game: GameExtendedEntity) {
		producer.sendToSingle(
			connectionId,
			WorldStateMessage(WorldStatePayload(GameExtendedDTO(game)))
		)
	}

	override suspend fun sendTurnResult(connectionId: Int, game: GameExtendedEntity, errors: List<CommandResolutionError>) {
		producer.sendToSingle(
			connectionId,
			TurnResultMessage(TurnResultPayload(GameExtendedDTO(game), errors.map { CommandResolutionErrorDTO(it) }))
		)
	}

}
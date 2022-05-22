package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage

interface GameMessageProducer {

	suspend fun sendWorldState(connectionId: Int, message: WorldStateMessage)

	suspend fun sendWorldState(connectionIds: List<Int>, message: WorldStateMessage)

}
package de.ruegnerlukas.strategygame.backend.core.service.world

import de.ruegnerlukas.strategygame.backend.core.ports.models.JoinWorldPayload
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldMessageHandler
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldService
import de.ruegnerlukas.strategygame.backend.core.ports.required.MessageProducer
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class WorldMessageHandlerImpl(private val messageProducer: MessageProducer, private val worldService: WorldService) : WorldMessageHandler {

	override suspend fun handleJoinWorld(connectionId: Int, payload: JoinWorldPayload) {
		val state = worldService.getWorldState(payload.worldId)
		messageProducer.sendToSingle(connectionId, "world-state", Json.encodeToString(state))
	}

}
package de.ruegnerlukas.strategygame.backend.core.service.world

import de.ruegnerlukas.strategygame.backend.core.ports.models.JoinWorldData
import de.ruegnerlukas.strategygame.backend.core.ports.models.NewTurnData
import de.ruegnerlukas.strategygame.backend.core.ports.models.PlayerMarker
import de.ruegnerlukas.strategygame.backend.core.ports.models.SubmitTurnData
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldMessageHandler
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldService
import de.ruegnerlukas.strategygame.backend.core.ports.required.MessageProducer
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class WorldMessageHandlerImpl(private val messageProducer: MessageProducer, private val worldService: WorldService) : WorldMessageHandler {

	override suspend fun handleJoinWorld(connectionId: Int, payload: JoinWorldData) {
		val state = worldService.getWorldState(payload.worldId)
		messageProducer.sendToSingle(connectionId, "world-state", Json.encodeToString(state))
	}

	override suspend fun handleSubmitWorld(connectionId: Int, payload: SubmitTurnData) {
		val data = NewTurnData(payload.commands.map { PlayerMarker(it.q, it.r, connectionId) })
		messageProducer.sendToAll("new-turn", Json.encodeToString(data))
	}

}

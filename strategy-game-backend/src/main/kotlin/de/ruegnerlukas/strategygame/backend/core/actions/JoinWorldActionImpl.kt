package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.models.WorldState
import de.ruegnerlukas.strategygame.backend.ports.provided.JoinWorldAction
import de.ruegnerlukas.strategygame.backend.ports.required.GenericMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.Repository
import de.ruegnerlukas.strategygame.backend.shared.Logging
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class JoinWorldActionImpl(
	private val messageProducer: GenericMessageProducer,
	private val repository: Repository
) : JoinWorldAction, Logging {

	override suspend fun perform(userId: String, connectionId: Int, worldId: String) {
		repository.getTilemap(worldId)
			.onSuccess { tilemap ->
				val state = WorldState(tilemap)
				repository.addParticipant(worldId, connectionId, userId)
				messageProducer.sendToSingle(connectionId, "world-state", Json.encodeToString(state))
				log().info("Player $userId (connectionId=$connectionId) joined world $worldId")
			}
			.onFailure {
				log().warn("Cant join world that does not exist ($worldId)")
			}
	}

}
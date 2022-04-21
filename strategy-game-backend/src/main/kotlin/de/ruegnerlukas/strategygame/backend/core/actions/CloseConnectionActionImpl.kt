package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.provided.CloseConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.required.Repository
import de.ruegnerlukas.strategygame.backend.shared.Logging

class CloseConnectionActionImpl(
	private val repository: Repository,
	private val endTurnAction: EndTurnAction
) : CloseConnectionAction, Logging {

	override suspend fun perform(connectionId: Int) {
		repository.removeParticipant(connectionId)
		log().info("Connection $connectionId closed and removed from worlds")
		repository.getWorldsByParticipant(connectionId).forEach { worldId ->
			if (repository.countPlayingParticipants(worldId).getOrThrow() == 0) {
				log().info("Ending turn due to closing of connection $connectionId")
				endTurnAction.perform(worldId)
			}
		}
	}


}
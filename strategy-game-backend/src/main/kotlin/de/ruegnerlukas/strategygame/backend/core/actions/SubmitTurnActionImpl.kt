package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.provided.SubmitTurnAction
import de.ruegnerlukas.strategygame.backend.ports.required.Repository
import de.ruegnerlukas.strategygame.backend.external.api.models.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.shared.Logging

class SubmitTurnActionImpl(
	private val repository: Repository,
	private val endTurnAction: EndTurnAction
) : SubmitTurnAction, Logging {

	override suspend fun perform(connectionId: Int, worldId: String, commands: List<PlaceMarkerCommand>) {
		log().info("Player (connection=$connectionId, world=$worldId) submitted the turn.")
		repository.endPlayerTurn(worldId, connectionId, commands)
		if (repository.countPlayingParticipants(worldId).getOrThrow() == 0) {
			log().info("Ending turn of world $worldId due to last player submitting a turn")
			endTurnAction.perform(worldId)
		}
	}


}
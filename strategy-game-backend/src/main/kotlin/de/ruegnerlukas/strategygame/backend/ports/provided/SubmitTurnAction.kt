package de.ruegnerlukas.strategygame.backend.ports.provided

import de.ruegnerlukas.strategygame.backend.external.api.models.PlaceMarkerCommand

interface SubmitTurnAction {

	/**
	 * Handle a turn submission
	 * @param connectionId the id of the connection sending the message
	 * @param worldId the id of the world
	 * @param commands the list of commands in the submitted turn
	 */
	suspend fun perform(connectionId: Int, worldId: String, commands: List<PlaceMarkerCommand>)

}
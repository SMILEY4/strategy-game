package de.ruegnerlukas.strategygame.backend.ports.provided

import de.ruegnerlukas.strategygame.backend.ports.models.messages.PlaceMarkerCommand

/**
 * Handle a player ending and submitting a turn
 */
interface SubmitTurnAction {

	/**
	 * @param userId the id of the user
	 * @param connectionId the id of the connection sending the message
	 * @param gameId the id of the world
	 * @param commands the list of commands in the submitted turn
	 */
	suspend fun perform(userId: String, connectionId: Int, gameId: String, commands: List<PlaceMarkerCommand>)

}
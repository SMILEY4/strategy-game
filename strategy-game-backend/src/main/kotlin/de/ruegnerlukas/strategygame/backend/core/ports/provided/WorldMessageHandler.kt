package de.ruegnerlukas.strategygame.backend.core.ports.provided

import de.ruegnerlukas.strategygame.backend.external.api.models.PlaceMarkerCommand

/**
 * Handler for world-related messages
 */
interface WorldMessageHandler {

	/**
	 * Handle a "join-world" message
	 * @param connectionId the id of the connection sending the message
	 * @param playerName the name of the player
	 * @param worldId the id of the world to join
	 */
	suspend fun handleJoinWorld(connectionId: Int, playerName: String, worldId: String)

	/**
	 * Handle a turn submission
	 * @param connectionId the id of the connection sending the message
	 * @param worldId the id of the world
	 * @param commands the list of commands in the submitted turn
	 */
	suspend fun handleSubmitTurn(connectionId: Int, worldId: String, commands: List<PlaceMarkerCommand>)

}
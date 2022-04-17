package de.ruegnerlukas.strategygame.backend.core.ports.provided

import de.ruegnerlukas.strategygame.backend.core.ports.models.JoinWorldData

/**
 * Handler for world-related messages
 */
interface WorldMessageHandler {

	/**
	 * Handle a "join-world" message
	 * @param connectionId the id of the connection sending the message
	 * @param payload the payload of the message
	 */
	suspend fun handleJoinWorld(connectionId: Int, payload: JoinWorldData)

}
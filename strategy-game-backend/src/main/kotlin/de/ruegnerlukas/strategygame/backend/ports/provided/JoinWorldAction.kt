package de.ruegnerlukas.strategygame.backend.ports.provided

interface JoinWorldAction {

	/**
	 * A player joins the given world
	 * @param userId the id of the user
	 * @param connectionId the id of the connection sending the message
	 * @param worldId the id of the world to join
	 */
	suspend fun perform(userId: String, connectionId: Int, worldId: String)

}
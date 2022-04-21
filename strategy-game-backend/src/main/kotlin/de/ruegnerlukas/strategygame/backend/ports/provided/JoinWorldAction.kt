package de.ruegnerlukas.strategygame.backend.ports.provided

interface JoinWorldAction {

	/**
	 * A player joins the given world
	 * @param connectionId the id of the connection sending the message
	 * @param playerName the name of the player
	 * @param worldId the id of the world to join
	 */
	suspend fun perform(connectionId: Int, playerName: String, worldId: String)

}
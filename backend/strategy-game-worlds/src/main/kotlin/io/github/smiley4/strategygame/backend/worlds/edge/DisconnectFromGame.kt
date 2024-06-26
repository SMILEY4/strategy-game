package io.github.smiley4.strategygame.backend.worlds.edge

/**
 * Disconnect the users from all connected games
 */
interface DisconnectFromGame {
	/**
	 * @param userId the user to disconnect from games
	 */
	suspend fun perform(userId: String)

}
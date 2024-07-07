package io.github.smiley4.strategygame.backend.worlds.edge

/**
 * Disconnect the users from all connected games
 */
interface DisconnectPlayer {
	/**
	 * @param userId the user to disconnect from games
	 */
	suspend fun perform(userId: String)

}
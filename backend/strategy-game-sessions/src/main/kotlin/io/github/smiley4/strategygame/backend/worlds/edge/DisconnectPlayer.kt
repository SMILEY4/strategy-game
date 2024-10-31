package io.github.smiley4.strategygame.backend.worlds.edge

import io.github.smiley4.strategygame.backend.commondata.User

/**
 * Disconnect the users from all connected games
 */
interface DisconnectPlayer {
	/**
	 * @param user the id of the user to disconnect from games
	 */
	suspend fun perform(user: User.Id)

}
package de.ruegnerlukas.strategygame.backend.ports.provided

import de.ruegnerlukas.strategygame.backend.shared.results.Result

/**
 * List all game-lobbies in which the given user is a participant
 */
interface ListPlayerGameLobbiesAction {

	/**
	 * @param userId the id of the user
	 */
	fun perform(userId: String): Result<List<String>>

}
package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.shared.results.Result

interface ListPlayerGameLobbiesAction {

	/**
	 * List all game-lobbies in which the given user is a participant
	 * @param userId the id of the user
	 */
	fun perform(userId: String): Result<List<String>>

}
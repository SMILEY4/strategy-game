package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.shared.results.Result

interface CreateGameLobbyAction {

	/**
	 * Create a new game lobby
	 * @param userId the id of the user creating the game-lobby
	 * @return a result with the id of the created game
	 */
	fun perform(userId: String): Result<String>

}
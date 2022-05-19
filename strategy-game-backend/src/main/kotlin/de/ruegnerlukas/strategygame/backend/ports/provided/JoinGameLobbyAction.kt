package de.ruegnerlukas.strategygame.backend.ports.provided

import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult

/**
 * Join an existing game-lobby created by another player.
 */
interface JoinGameLobbyAction {

	/**
	 * @param userId the id of the user creating the game-lobby
	 * @param gameId the id of the game-lobby
	 */
	fun perform(userId: String, gameId: String): VoidResult

}
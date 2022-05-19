package de.ruegnerlukas.strategygame.backend.ports.provided

import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult

/**
 * Connects to the game lobby with the given id. The user must be a participant of the game-lobby
 */
interface RequestConnectGameLobbyAction {

	/**
	 * @param userId the id of the user connecting the game-lobby
	 * @param gameId the id of the game-lobby
	 */
	fun perform(userId: String, gameId: String): VoidResult

}
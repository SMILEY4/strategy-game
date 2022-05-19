package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult

interface JoinGameLobbyAction {

	/**
	 * Join an existing game-lobby created by another player.
	 * @param userId the id of the user creating the game-lobby
	 * @param gameId the id of the game-lobby
	 */
	fun perform(userId: String, gameId: String): VoidResult

}
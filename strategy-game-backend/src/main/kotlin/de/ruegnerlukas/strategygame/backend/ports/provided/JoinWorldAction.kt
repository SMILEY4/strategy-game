package de.ruegnerlukas.strategygame.backend.ports.provided

interface JoinWorldAction {

	/**
	 * A player joins the given game
	 * @param userId the id of the user
	 * @param connectionId the id of the connection sending the message
	 * @param gameId the id of the game-lobby to join
	 */
	suspend fun perform(userId: String, connectionId: Int, gameId: String)

}
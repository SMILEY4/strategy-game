package de.ruegnerlukas.strategygame.backend.ports.provided

/**
 * A player joins the given game
 */
interface JoinWorldAction {

	/**
	 * @param userId the id of the user
	 * @param connectionId the id of the connection sending the message
	 * @param gameId the id of the game-lobby to join
	 */
	suspend fun perform(userId: String, connectionId: Int, gameId: String)

}
package de.ruegnerlukas.strategygame.backend.ports.provided

interface CloseConnectionAction {

	/**
	 * Handle a player closing the connection
	 * @param userId the id of the user closing the connection
	 */
	suspend fun perform(userId: String)

}
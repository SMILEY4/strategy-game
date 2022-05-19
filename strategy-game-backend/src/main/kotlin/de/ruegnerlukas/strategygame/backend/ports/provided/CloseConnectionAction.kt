package de.ruegnerlukas.strategygame.backend.ports.provided

/**
 * Handle a player closing the connection
 */
interface CloseConnectionAction {

	/**
	 * @param userId the id of the user closing the connection
	 */
	suspend fun perform(userId: String)

}
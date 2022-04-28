package de.ruegnerlukas.strategygame.backend.ports.provided

interface CloseConnectionAction {

	/**
	 * Handle a player closing the connection
	 * @param connectionId the id of the closed connection
	 */
	suspend fun perform(connectionId: Int)

}
package de.ruegnerlukas.strategygame.backend.ports.provided.game

/**
 * Create a new game
 */
interface GameCreateAction {

	/**
	 * @return the id of the game
	 */
	suspend fun perform(): String

}
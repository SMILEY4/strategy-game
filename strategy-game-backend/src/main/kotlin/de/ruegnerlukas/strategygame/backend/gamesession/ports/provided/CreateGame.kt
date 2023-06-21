package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings

/**
 * Create a new game
 */
interface CreateGame {

	/**
	 * @return the id of the game
	 */
	suspend fun perform(worldSettings: WorldSettings): String

}
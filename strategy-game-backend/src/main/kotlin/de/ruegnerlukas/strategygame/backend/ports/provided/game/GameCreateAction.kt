package de.ruegnerlukas.strategygame.backend.ports.provided.game

import de.ruegnerlukas.strategygame.backend.ports.models.world.WorldSettings

/**
 * Create a new game
 */
interface GameCreateAction {

	/**
	 * @return the id of the game
	 */
	suspend fun perform(worldSettings: WorldSettings): String

}
package de.ruegnerlukas.strategygame.backend.core.ports.provided

import de.ruegnerlukas.strategygame.backend.core.ports.models.WorldMeta
import de.ruegnerlukas.strategygame.backend.core.ports.models.WorldState

/**
 * Handler for world-related logic
 */
interface WorldService {

	/**
	 * Create a new world
	 * @return meta-information about the created world
	 */
	fun createNew(): Result<WorldMeta>


	/**
	 * Get the current state of the world with the given id
	 */
	fun getWorldState(worldId: String): WorldState

}
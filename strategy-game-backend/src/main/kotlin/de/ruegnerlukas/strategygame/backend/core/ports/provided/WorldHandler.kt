package de.ruegnerlukas.strategygame.backend.core.ports.provided

import de.ruegnerlukas.strategygame.backend.core.ports.models.WorldMeta

/**
 * Handler for world-related logic
 */
interface WorldHandler {

	/**
	 * Create a new world
	 * @return meta-information about the created world
	 */
	fun create(): Result<WorldMeta>

}
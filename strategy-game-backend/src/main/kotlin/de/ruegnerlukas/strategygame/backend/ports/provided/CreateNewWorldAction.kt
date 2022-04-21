package de.ruegnerlukas.strategygame.backend.ports.provided

import de.ruegnerlukas.strategygame.backend.ports.models.WorldMeta

interface CreateNewWorldAction {

	/**
	 * Create a new world
	 * @return meta-information about the created world
	 */
	fun perform(): Result<WorldMeta>

}
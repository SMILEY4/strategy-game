package de.ruegnerlukas.strategygame.backend.core.ports.provided

import de.ruegnerlukas.strategygame.backend.core.ports.models.WorldMeta

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
	 * Handle a player closing the connection
	 * @param connectionId the id of the closed connection
	 */
	suspend fun handleCloseConnection(connectionId: Int)


}
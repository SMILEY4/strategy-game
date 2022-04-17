package de.ruegnerlukas.strategygame.backend.core.ports.required

import de.ruegnerlukas.strategygame.backend.core.ports.models.Tilemap

/**
 * Saves data related to worlds
 */
interface WorldRepository {

	/**
	 * Save the tilemap with the given id
	 */
	fun saveTilemap(map: Tilemap, id: String)

	/**
	 * Retrieve a tilemap with the given id
	 */
	fun getTilemap(id: String): Result<Tilemap>

}
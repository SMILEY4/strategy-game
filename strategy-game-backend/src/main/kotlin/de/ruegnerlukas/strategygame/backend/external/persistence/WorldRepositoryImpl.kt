package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.strategygame.backend.core.ports.models.Tilemap
import de.ruegnerlukas.strategygame.backend.core.ports.required.WorldRepository
import de.ruegnerlukas.strategygame.backend.shared.failure

class WorldRepositoryImpl : WorldRepository {

	private val maps: MutableMap<String, Tilemap> = mutableMapOf()


	override fun saveTilemap(map: Tilemap, id: String) {
		maps[id] = map
	}


	override fun getTilemap(id: String): Result<Tilemap> {
		return if (maps.containsKey(id)) {
			Result.success(maps[id]!!)
		} else {
			Result.failure("No map with id $id found")
		}
	}


}
package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.models.WorldMeta
import de.ruegnerlukas.strategygame.backend.ports.provided.CreateNewWorldAction
import de.ruegnerlukas.strategygame.backend.ports.required.Repository
import de.ruegnerlukas.strategygame.backend.core.tilemap.TilemapBuilder
import de.ruegnerlukas.strategygame.backend.shared.Logging
import java.util.UUID

class CreateNewWorldActionImpl(private val repository: Repository) : CreateNewWorldAction, Logging {

	override fun perform(): Result<WorldMeta> {
		val id = createTilemap()
		log().info("Created new map with id $id")
		return Result.success(WorldMeta(id))
	}

	private fun createTilemap(): String {
		val tilemap = TilemapBuilder().build()
		val id = UUID.randomUUID()!!.toString()
		repository.saveTilemap(tilemap, id)
		return id
	}

}
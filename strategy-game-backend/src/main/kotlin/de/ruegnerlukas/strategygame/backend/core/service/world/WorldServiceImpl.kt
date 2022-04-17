package de.ruegnerlukas.strategygame.backend.core.service.world

import de.ruegnerlukas.strategygame.backend.core.ports.models.WorldMeta
import de.ruegnerlukas.strategygame.backend.core.ports.models.WorldState
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldService
import de.ruegnerlukas.strategygame.backend.core.ports.required.WorldRepository
import de.ruegnerlukas.strategygame.backend.core.service.world.tilemap.TilemapBuilder
import de.ruegnerlukas.strategygame.backend.shared.Logging
import java.util.UUID

/**
 * Implementation of a [WorldService]
 */
class WorldServiceImpl(private val worldRepository: WorldRepository) : Logging, WorldService {

	override fun createNew(): Result<WorldMeta> {
		val tilemap = TilemapBuilder().build()
		val uuid = UUID.randomUUID()!!.toString()
		worldRepository.saveTilemap(tilemap, uuid)
		log().info("Created new map with id $uuid")
		val worldMeta = WorldMeta(uuid)
		return Result.success(worldMeta)
	}

	override fun getWorldState(worldId: String): WorldState {
		val tilemap = worldRepository.getTilemap(worldId).getOrThrow()
		return WorldState(tilemap)
	}

}
package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile

interface GameMessageProducer {

	suspend fun sendWorldState(connectionId: Int, tiles: List<Tile>)

}
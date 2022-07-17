package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldExtendedEntity

interface GameMessageProducer {

	suspend fun sendWorldState(connectionId: Int, world: WorldExtendedEntity)

}
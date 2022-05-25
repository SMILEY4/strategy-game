package de.ruegnerlukas.strategygame.backend.ports.models.messages

import de.ruegnerlukas.strategygame.backend.ports.models.game.WorldEntity
import kotlinx.serialization.Serializable

@Serializable
data class WorldStateMessage(
	val world: WorldEntity
)
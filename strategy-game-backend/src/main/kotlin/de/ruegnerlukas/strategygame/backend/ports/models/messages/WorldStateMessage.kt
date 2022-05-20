package de.ruegnerlukas.strategygame.backend.ports.models.messages

import de.ruegnerlukas.strategygame.backend.ports.models.game.Marker
import de.ruegnerlukas.strategygame.backend.ports.models.game.Tilemap
import kotlinx.serialization.Serializable

@Serializable
data class WorldStateMessage(
	val map: Tilemap,
	val markers: List<Marker>
)
package de.ruegnerlukas.strategygame.backend.ports.models.game

import kotlinx.serialization.Serializable

@Serializable
data class PlaceMarkerCommand(
	val q: Int,
	val r: Int
)
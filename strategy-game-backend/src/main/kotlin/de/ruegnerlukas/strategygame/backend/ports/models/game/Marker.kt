package de.ruegnerlukas.strategygame.backend.ports.models.game
import kotlinx.serialization.Serializable

@Serializable
data class Marker(
	val q: Int,
	val r: Int,
	val userId: String
)

package de.ruegnerlukas.strategygame.backend.external.api.models

import kotlinx.serialization.Serializable

@Serializable
data class NewTurnData(
	val addedMarkers: List<PlayerMarker>
)


@Serializable
data class PlayerMarker(
	val q: Int,
	val r: Int,
	val playerId: Int,
)

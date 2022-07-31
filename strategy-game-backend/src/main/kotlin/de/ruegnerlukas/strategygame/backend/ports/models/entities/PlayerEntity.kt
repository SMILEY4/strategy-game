package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class PlayerEntity(
	val id: String,
	val userId: String,
	val gameId: String,
	val connectionId: Int?,
	val state: String,
	val countryId: String,
) {
	companion object {
		const val STATE_PLAYING = "playing"
		const val STATE_SUBMITTED = "submitted"
	}
}

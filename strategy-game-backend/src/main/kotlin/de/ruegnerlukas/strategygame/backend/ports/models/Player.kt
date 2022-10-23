package de.ruegnerlukas.strategygame.backend.ports.models

data class Player(
    val userId: String,
    var connectionId: Int?,
    var state: String
) {
    companion object {
        const val STATE_PLAYING = "playing"
        const val STATE_SUBMITTED = "submitted"
    }
}
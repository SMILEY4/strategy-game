package de.ruegnerlukas.strategygame.backend.common.models

data class Player(
    val userId: String,
    var connectionId: Long?,
    var state: String
) {
    companion object {
        const val STATE_PLAYING = "playing"
        const val STATE_SUBMITTED = "submitted"
    }
}
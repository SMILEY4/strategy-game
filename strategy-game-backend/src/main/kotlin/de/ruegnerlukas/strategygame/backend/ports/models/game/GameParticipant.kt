package de.ruegnerlukas.strategygame.backend.ports.models.game

data class GameParticipant(
	val userId: String,
	val owner: Boolean
) {
	companion object {
		fun owner(userId: String) = GameParticipant(userId, true)
		fun participant(userId: String) = GameParticipant(userId, false)
	}
}

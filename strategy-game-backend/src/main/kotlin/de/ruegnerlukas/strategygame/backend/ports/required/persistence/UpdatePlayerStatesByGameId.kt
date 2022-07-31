package de.ruegnerlukas.strategygame.backend.ports.required.persistence

interface UpdatePlayerStatesByGameId {
	suspend fun execute(gameId: String, state: String)
}
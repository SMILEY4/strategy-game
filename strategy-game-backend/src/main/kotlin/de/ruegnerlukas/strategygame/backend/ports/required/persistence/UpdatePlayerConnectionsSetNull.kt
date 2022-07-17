package de.ruegnerlukas.strategygame.backend.ports.required.persistence

interface UpdatePlayerConnectionsSetNull {
	suspend fun execute(userId: String)
}
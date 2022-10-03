package de.ruegnerlukas.strategygame.backend.ports.required.persistence

interface GameDelete {
    suspend fun execute(gameId: String)
}
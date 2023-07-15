package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

interface GameDelete {
    suspend fun execute(gameId: String)
}
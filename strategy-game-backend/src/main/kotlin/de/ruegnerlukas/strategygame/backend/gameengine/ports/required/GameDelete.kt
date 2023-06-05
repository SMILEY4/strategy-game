package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

interface GameDelete {
    suspend fun execute(gameId: String)
}
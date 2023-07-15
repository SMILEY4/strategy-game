package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

interface GameExistsQuery {
    suspend fun perform(gameId: String): Boolean
}
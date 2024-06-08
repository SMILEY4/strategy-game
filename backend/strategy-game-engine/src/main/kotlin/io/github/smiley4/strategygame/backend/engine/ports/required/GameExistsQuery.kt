package io.github.smiley4.strategygame.backend.engine.ports.required

interface GameExistsQuery {
    suspend fun perform(gameId: String): Boolean
}
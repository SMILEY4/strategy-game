package io.github.smiley4.strategygame.backend.worlds.ports.required

interface GameDelete {
    suspend fun execute(gameId: String)
}
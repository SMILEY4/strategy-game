package io.github.smiley4.strategygame.backend.worlds.module.core.required

interface GameDelete {
    suspend fun execute(gameId: String)
}
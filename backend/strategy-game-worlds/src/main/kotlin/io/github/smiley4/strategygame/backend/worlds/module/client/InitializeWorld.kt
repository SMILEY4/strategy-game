package io.github.smiley4.strategygame.backend.worlds.module.client

import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings

internal interface InitializeWorld {
    suspend fun perform(gameId: String, worldSettings: WorldGenSettings): Unit
}
package io.github.smiley4.strategygame.backend.worlds.module.client

import io.github.smiley4.strategygame.backend.common.utils.RGBColor


internal interface InitializePlayer {
    suspend fun perform(gameId: String, userId: String, rgbColor: RGBColor): Unit
}
package io.github.smiley4.strategygame.backend.sessions.application.engine

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.ports.required.InitializePlayer

internal class InitializePlayerAdapter(
    private val engineService: io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer
) : InitializePlayer {

    override suspend fun perform(game: GameExtended, userId: User.Id) {
        try {
            return engineService.perform(game, userId)
        } catch (e: io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer.InitializePlayerError) {
            throw when (e) {
                is io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer.GameNotFoundError -> InitializePlayer.GameNotFoundError()
            }
        }
    }

}
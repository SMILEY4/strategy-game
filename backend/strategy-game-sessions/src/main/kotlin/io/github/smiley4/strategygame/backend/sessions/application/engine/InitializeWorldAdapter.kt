package io.github.smiley4.strategygame.backend.sessions.application.engine

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.sessions.ports.required.InitializeWorld

internal class InitializeWorldAdapter(
    private val engineService: io.github.smiley4.strategygame.backend.engine.edge.InitializeWorld
) : InitializeWorld {

    override suspend fun perform(game: Game, worldSeed: Int?): GameExtended {
        return engineService.perform(game, worldSeed)
    }

}
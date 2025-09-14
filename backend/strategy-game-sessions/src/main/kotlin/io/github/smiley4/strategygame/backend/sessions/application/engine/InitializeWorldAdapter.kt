package io.github.smiley4.strategygame.backend.sessions.application.engine

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.sessions.ports.required.InitializeWorld
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializeWorld as EngineInitializeWorld

internal class InitializeWorldAdapter(private val impl: EngineInitializeWorld) : InitializeWorld {

    override suspend fun perform(game: Game, worldSeed: Int?): GameState {
        return impl.perform(game, worldSeed)
    }

}
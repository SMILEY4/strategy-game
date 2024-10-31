package io.github.smiley4.strategygame.backend.sessions.application.engine

import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.sessions.ports.required.GameStep
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep as EngineGameStep

internal class GameStepAdapter(private val impl: EngineGameStep) : GameStep {

    override suspend fun perform(game: GameExtended, commands: Collection<Command<*>>) {
        return impl.perform(game, commands)
    }

}
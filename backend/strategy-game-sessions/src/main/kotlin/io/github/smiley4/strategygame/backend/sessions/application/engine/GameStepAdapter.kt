package io.github.smiley4.strategygame.backend.sessions.application.engine

import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.sessions.ports.required.GameStep

internal class GameStepAdapter(
    private val engineService: io.github.smiley4.strategygame.backend.engine.edge.GameStep
) : GameStep {

    override suspend fun perform(game: GameExtended, commands: Collection<Command<*>>) {
        return engineService.perform(game, commands)
    }

}
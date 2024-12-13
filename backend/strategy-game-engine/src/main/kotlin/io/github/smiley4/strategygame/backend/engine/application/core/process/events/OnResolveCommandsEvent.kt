package io.github.smiley4.strategygame.backend.engine.application.core.process.events

import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessEvent

class OnResolveCommandsEvent(
    val game: GameExtended,
    val commands: Collection<Command<*>>
) : ProcessEvent
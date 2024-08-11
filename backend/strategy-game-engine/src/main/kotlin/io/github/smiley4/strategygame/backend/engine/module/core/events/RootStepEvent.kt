package io.github.smiley4.strategygame.backend.engine.module.core.events

import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended

internal data class RootStepEvent(
    val game: GameExtended,
    val commands: Collection<Command<*>>
)
package io.github.smiley4.strategygame.backend.engine.application.core.process.events

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.engine.application.core.processsystem.ProcessEvent

class OnUpdateWorldEvent(
    val game: GameExtended,
) : ProcessEvent
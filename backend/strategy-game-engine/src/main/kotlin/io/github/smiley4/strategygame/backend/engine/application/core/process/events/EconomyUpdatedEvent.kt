package io.github.smiley4.strategygame.backend.engine.application.core.process.events

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.engine.application.core.processsystem.ProcessEvent

class EconomyUpdatedEvent(
    val game: GameExtended,
    val report: EconomyReport
) : ProcessEvent
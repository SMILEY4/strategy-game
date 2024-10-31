package io.github.smiley4.strategygame.backend.engine.application.core.events

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport

internal data class UpdatedEconomyEvent(
    val game: GameExtended,
    val report: EconomyReport
)
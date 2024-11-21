package io.github.smiley4.strategygame.backend.engine.application.core.events

import io.github.smiley4.strategygame.backend.commondata.Building
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement

internal data class ProducedBuildingEvent(
    val game: GameExtended,
    val settlement: Settlement,
    val building: Building
)
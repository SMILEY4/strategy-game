package io.github.smiley4.strategygame.backend.engine.application.core.process.events

import io.github.smiley4.strategygame.backend.commondata.Building
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessEvent

class CreatedBuildingEvent(
    val game: GameExtended,
    val settlement: Settlement,
    val building: Building
) : ProcessEvent
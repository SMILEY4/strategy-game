package io.github.smiley4.strategygame.backend.engine.application.core.process.events

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessEvent

class CreatedSettlementEvent(
    val game: GameExtended,
    val settlement: Settlement,
) : ProcessEvent
package io.github.smiley4.strategygame.backend.engine.module.core.events

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.WorldObject

internal data class ProducedSettlerEvent(
    val game: GameExtended,
    val settlement: Settlement,
    val settler: WorldObject.Settler
)
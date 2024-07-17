package io.github.smiley4.strategygame.backend.engine.module.core.events

import io.github.smiley4.strategygame.backend.commondata.GameExtended

data class UpdateWorldEvent(
    val game: GameExtended
)
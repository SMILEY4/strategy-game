package io.github.smiley4.strategygame.backend.engine.application.core.events

import io.github.smiley4.strategygame.backend.commondata.GameExtended

internal data class UpdateWorldEvent(
    val game: GameExtended
)
package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.commondata.GameExtended


data class OperationInvalidData(
    val game: GameExtended,
    val codes: Set<String>
)
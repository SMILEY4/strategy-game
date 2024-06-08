package io.github.smiley4.strategygame.backend.engine.core.gamestep

import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended


data class OperationInvalidData(
    val game: GameExtended,
    val codes: Set<String>
)
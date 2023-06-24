package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

data class OperationInvalidData(
    val game: GameExtended,
    val codes: Set<String>
)
package de.ruegnerlukas.strategygame.backend.common.models

import de.ruegnerlukas.strategygame.backend.common.models.containers.PlayerContainer
import de.ruegnerlukas.strategygame.backend.ports.models.containers.PlayerContainer

data class Game(
    val gameId: String,
    var turn: Int,
    val players: PlayerContainer
)

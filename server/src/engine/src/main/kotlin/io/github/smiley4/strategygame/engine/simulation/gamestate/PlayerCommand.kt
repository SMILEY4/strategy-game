package io.github.smiley4.strategygame.engine.simulation.gamestate

import io.github.smiley4.strategygame.shared.values.UserId

sealed interface PlayerCommand {

    val playerId: UserId

    class CreateSettlement(
        override val playerId: UserId,
        val location: HexPosition,
        val name: String,
    ) : PlayerCommand
}



package io.github.smiley4.strategygame.engine.simulation.gamestate

import io.github.smiley4.strategygame.shared.values.UserId

sealed interface PlayerCommand {

    val playerId: UserId

    class FoundRealmCapital(val location: HexPosition, override val playerId: UserId) : PlayerCommand
}



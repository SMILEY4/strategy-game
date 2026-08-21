package io.github.smiley4.strategygame.engine.simulation.turn.systems

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext

internal sealed interface GameSystem {
    fun execute(gameState: GameStateContext)
}
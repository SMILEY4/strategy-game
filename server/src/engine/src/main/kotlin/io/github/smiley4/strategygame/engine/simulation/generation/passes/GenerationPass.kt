package io.github.smiley4.strategygame.engine.simulation.generation.passes

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.generation.GenerationContext

internal interface GenerationPass {
    fun execute(gameState: GameStateContext, generationContext: GenerationContext)
}
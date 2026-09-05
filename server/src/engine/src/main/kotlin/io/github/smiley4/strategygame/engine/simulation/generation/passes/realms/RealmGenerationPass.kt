package io.github.smiley4.strategygame.engine.simulation.generation.passes.realms

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.generation.GenerationContext
import io.github.smiley4.strategygame.engine.simulation.generation.passes.GenerationPass

/**
 * Generates realm for each player
 */
internal class RealmGenerationPass : GenerationPass {

    override fun execute(gameState: GameStateContext, generationContext: GenerationContext) {
        generationContext.players.forEach { player ->
            gameState.realms.add(
                Realm(
                    id = Realm.Id(),
                    user = player,
                    spawnLocation = HexPosition(0,0)
                )
            )
        }
    }

}
package io.github.smiley4.strategygame.engine.simulation.generation.passes.spawns

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.distance
import io.github.smiley4.strategygame.engine.simulation.generation.GenerationContext
import io.github.smiley4.strategygame.engine.simulation.generation.passes.GenerationPass

/**
 * Picks player spawn locations
 */
internal class SpawnGenerationPass : GenerationPass {

    override fun execute(gameState: GameStateContext, generationContext: GenerationContext) {
        generationContext.players.forEach { player ->

            val spawn = Entity(
                id = Entity.Id(),
                components = listOf(
                    EntityComponent.Position(gameState.tiles.random().ref()),
                    EntityComponent.PlayerSpawn(player, 3)
                )
            )

            gameState.entities.add(spawn)

            gameState.tiles
                .asSequence()
                .filter { it.position.distance(spawn.getComponent<EntityComponent.Position>().tile.position) <= spawn.getComponent<EntityComponent.PlayerSpawn>().radius }
                .forEach { tile -> tile.discoveredBy.add(player) }

        }
    }

}
package io.github.smiley4.strategygame.engine.simulation.generation

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.generation.passes.realms.RealmGenerationPass
import io.github.smiley4.strategygame.engine.simulation.generation.passes.spawns.SpawnGenerationPass
import io.github.smiley4.strategygame.engine.simulation.generation.passes.terrain.TerrainGenerationPass
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId

internal class WorldGenerator {

    private val generationPasses = listOf(
        TerrainGenerationPass(),
        RealmGenerationPass(),
        SpawnGenerationPass()
    )

    fun generate(id: GameId, players: Collection<UserId>): GameStateContext {
        val generationContext = GenerationContext(
            players = players.toSet(),
        )
        val gameState = GameStateContext(
            id = id,
            turn = 0,
            realms = mutableListOf(),
            tiles = mutableListOf(),
            entities = mutableListOf(),
        )
        generationPasses.forEach { it.execute(gameState, generationContext) }
        return gameState
    }

}
package io.github.smiley4.strategygame.engine.simulation.generation.passes.spawns

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.distance
import io.github.smiley4.strategygame.engine.simulation.gamestate.iterateCircle
import io.github.smiley4.strategygame.engine.simulation.generation.GenerationContext
import io.github.smiley4.strategygame.engine.simulation.generation.passes.GenerationPass
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation
import io.github.smiley4.strategygame.shared.utils.repeatUntil


/**
 * Picks realm spawn locations
 */
internal class SpawnGenerationPass : GenerationPass {

    companion object {
        private const val SPAWN_RADIUS = 3
        private const val MAX_ATTEMPTS_HIGH_QUALITY = 5
        private const val MAX_ATTEMPTS_LOW_QUALITY = 5
    }

    override fun execute(gameState: GameStateContext, generationContext: GenerationContext) {
        val spawnLocations = mutableListOf<Tile.Ref>()
        gameState.realms.forEach { realm ->

            var spawnLocation: Tile.Ref? = null

            // attempt to find high quality location
            repeatUntil(MAX_ATTEMPTS_HIGH_QUALITY) {
                val location = gameState.tiles.random().ref()
                val score = rankSpawn(location, SPAWN_RADIUS, gameState, spawnLocations)
                if (score >= 5) {
                    spawnLocation = location
                    return@repeatUntil true
                }
                return@repeatUntil false
            }

            // attempt to find low quality location
            if (spawnLocation == null) {
                repeatUntil(MAX_ATTEMPTS_LOW_QUALITY) {
                    val location = gameState.tiles.random().ref()
                    val score = rankSpawn(location, SPAWN_RADIUS, gameState, spawnLocations)
                    if (score >= 3) {
                        spawnLocation = location
                        return@repeatUntil true
                    }
                    return@repeatUntil false
                }
            }

            // use random location as fallback
            val selectedSpawn = spawnLocation ?: gameState.tiles.random().ref()

            spawnLocations.add(selectedSpawn)
            gameState.tiles
                .asSequence()
                .filter { it.position.distance(selectedSpawn.position) <= SPAWN_RADIUS }
                .forEach { tile -> tile.political.discoveredBy.add(realm.id) }
        }
    }


    /**
     * Scores given player spawn location. max possible score = 5
     */
    fun rankSpawn(spawnLocation: Tile.Ref, radius: Int, gameState: GameStateContext, spawnLocations: Collection<Tile.Ref>): Int {

        var countOutOfBounds = 0
        var countTotal = 0
        var countLand = 0
        var countValid = 0;

        spawnLocation.position.iterateCircle(radius) { pos ->
            val tile = gameState.tiles.find { it.position == pos }
            if (tile == null) {
                countOutOfBounds++
            } else {
                countTotal++
                if (tile.world.biome != Tile.Biome.OCEAN) {
                    countLand++
                }
                if (SettlementValidation.isTerrainSuitable(tile)) {
                    countValid++
                }
            }
        }

        val closestSpawn = spawnLocations.minOfOrNull { it.position.distance(spawnLocation.position) } ?: Int.MAX_VALUE

        var score = 0
        if (countOutOfBounds == 0) score++
        if (countLand >= countTotal / 2) score++
        if (countValid >= 3) score++
        if (closestSpawn > radius * 2) score += 2

        return score
    }


}

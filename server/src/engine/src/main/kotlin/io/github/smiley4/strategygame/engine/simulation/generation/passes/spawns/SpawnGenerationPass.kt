package io.github.smiley4.strategygame.engine.simulation.generation.passes.spawns

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.distance
import io.github.smiley4.strategygame.engine.simulation.gamestate.iterateCircle
import io.github.smiley4.strategygame.engine.simulation.generation.GenerationContext
import io.github.smiley4.strategygame.engine.simulation.generation.passes.GenerationPass
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation
import net.logstash.logback.argument.StructuredArguments.r
import kotlin.math.abs
import kotlin.math.min


/**
 * Picks player spawn locations
 */
internal class SpawnGenerationPass : GenerationPass {

    companion object {
        private const val SPAWN_RADIUS = 3
        private const val MAX_ATTEMPTS_HIGH_QUALITY = 5
        private const val MAX_ATTEMPTS_LOW_QUALITY = 5
    }

    override fun execute(gameState: GameStateContext, generationContext: GenerationContext) {
        generationContext.players.forEach { player ->

            var spawnLocation: Tile.Ref? = null
            for (i in 1..MAX_ATTEMPTS_HIGH_QUALITY) {
                val location = pickSpawnLocation(gameState)
                val score = rankSpawn(location, SPAWN_RADIUS, gameState)
                if (score >= 5) {
                    spawnLocation = location
                    break
                }
            }
            if (spawnLocation == null) {
                for (i in 1..MAX_ATTEMPTS_LOW_QUALITY) {
                    val location = pickSpawnLocation(gameState)
                    val score = rankSpawn(location, SPAWN_RADIUS, gameState)
                    if (score >= 3) {
                        spawnLocation = location
                        break
                    }
                }
            }
            if (spawnLocation == null) {
                spawnLocation = pickSpawnLocation(gameState)
            }

            val spawn = Entity(
                id = Entity.Id(),
                owner = player,
                components = listOf(
                    EntityComponent.Position(spawnLocation),
                    EntityComponent.PlayerSpawn(SPAWN_RADIUS, false)
                )
            )

            gameState.entities.add(spawn)

            gameState.tiles
                .asSequence()
                .filter { it.position.distance(spawn.getComponent<EntityComponent.Position>().tile.position) <= spawn.getComponent<EntityComponent.PlayerSpawn>().radius }
                .forEach { tile -> tile.political.discoveredBy.add(player) }

        }
    }


    fun pickSpawnLocation(gameState: GameStateContext): Tile.Ref {
        return gameState.tiles.random().ref()
    }


    /**
     * Scores given player spawn location. max possible score = 5
     */
    fun rankSpawn(spawnLocation: Tile.Ref, radius: Int, gameState: GameStateContext): Int {

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
                if (SettlementValidation.validateFirst(gameState, tile)) {
                    countValid++
                }
            }
        }

        var closestSpawn = Int.MAX_VALUE
        gameState.entities.forEach { entity ->
            val spawnComponent = entity.getComponentOrNull<EntityComponent.PlayerSpawn>()
            val positionComponent = entity.getComponentOrNull<EntityComponent.Position>()
            if (spawnComponent != null && positionComponent != null) {
                closestSpawn = min(closestSpawn, positionComponent.tile.position.distance(spawnLocation.position))
            }
        }

        var score = 0
        if (countOutOfBounds == 0) score++
        if (countLand >= countTotal / 2) score++
        if (countValid >= 3) score++
        if (closestSpawn > radius * 2) score += 2

        return score
    }


}
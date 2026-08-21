package io.github.smiley4.strategygame.engine.simulation.generation.passes.spawns

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.distance
import io.github.smiley4.strategygame.engine.simulation.generation.GenerationContext
import io.github.smiley4.strategygame.engine.simulation.generation.passes.GenerationPass
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation
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
                .forEach { tile -> tile.discoveredBy.add(player) }

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

        positionsCircle(spawnLocation.position.q, spawnLocation.position.r, radius) { q, r ->
            val tile = gameState.tiles.find { it.position.q == q && it.position.r == r }
            if (tile == null) {
                countOutOfBounds++
            } else {
                countTotal++
                if (tile.world.biome != Tile.Biome.OCEAN) {
                    countLand++
                }
                if (SettlementValidation.validate(gameState, tile)) {
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


// todo technical dept: move this to some other file and remove duplicates
fun positionsCircle(centerQ: Int, centerR: Int, radius: Int, consumer: (q: Int, r: Int) -> Unit) {
    for (iq in (centerQ - radius)..(centerQ + radius)) {
        for (ir in (centerR - radius)..(centerR + radius)) {
            if (hexDistance(centerQ, centerR, iq, ir) <= radius) {
                consumer(iq, ir)
            }
        }
    }
}

fun hexDistance(q0: Int, r0: Int, q1: Int, r1: Int): Int {
    val d = hexSub(q0, r0, q1, r1)
    return hexLength(d.first, d.second)
}

fun hexLength(q: Int, r: Int): Int {
    return (abs(q) + abs(r) + abs(hexS(q, r))) / 2
}

fun hexSub(q0: Int, r0: Int, q1: Int, r1: Int): Pair<Int, Int> {
    return Pair(
        q0 - q1,
        r0 - r1
    )
}

fun hexS(q: Int, r: Int): Int {
    return -q - r
}
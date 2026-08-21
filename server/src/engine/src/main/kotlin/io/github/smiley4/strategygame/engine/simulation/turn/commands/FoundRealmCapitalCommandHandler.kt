package io.github.smiley4.strategygame.engine.simulation.turn.commands

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation
import kotlin.math.abs

class FoundRealmCapitalCommandHandler : CommandHandler<PlayerCommand.FoundRealmCapital> {

    override val commandType = PlayerCommand.FoundRealmCapital::class

    override fun handle(gameState: GameStateContext, command: PlayerCommand.FoundRealmCapital) {

        // validate
        if (!SettlementValidation.validateCapital(gameState, command.location, command.playerId)) {
            throw IllegalArgumentException("Invalid settlement location")
        }

        // create settlement
        val tile = gameState.tiles.first { it.position == command.location }
        gameState.entities.add(
            Entity(
                id = Entity.Id(),
                owner = command.playerId,
                components = listOf(
                    EntityComponent.Position(tile.ref()),
                    EntityComponent.Settlement(command.name.trim(), true),
                    EntityComponent.Vision(2)
                )
            )
        )

        // mark spawn as "founded capital"
        gameState.entities.find { it.hasComponent<EntityComponent.PlayerSpawn>() && it.owner == command.playerId }?.also {
            it.getComponent<EntityComponent.PlayerSpawn>().foundedCapital = true
        }

        // mark tiles as discovered
        positionsCircle(tile.position.q, tile.position.r, 2) { q, r ->
            gameState.tiles.find { it.position.q == q && it.position.r == r }?.also {
                it.discoveredBy.add(command.playerId)
            }
        }

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
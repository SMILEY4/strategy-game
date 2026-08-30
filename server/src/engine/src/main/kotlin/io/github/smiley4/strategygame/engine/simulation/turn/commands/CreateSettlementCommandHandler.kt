package io.github.smiley4.strategygame.engine.simulation.turn.commands

import com.sun.media.sound.EmergencySoundbank.toFloat
import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.distance
import io.github.smiley4.strategygame.engine.simulation.gamestate.iterateCircle
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation

internal class CreateSettlementCommandHandler : CommandHandler<PlayerCommand.CreateSettlement> {

    override val commandType = PlayerCommand.CreateSettlement::class

    override fun handle(gameState: GameStateContext, command: PlayerCommand.CreateSettlement) {

        // find spawn entity -> whether it is the first, realm-founding settlement
        val spawnEntity = gameState.entities.first { it.hasComponent<EntityComponent.PlayerSpawn>() && it.owner == command.playerId }

        // validate
        val valid = if (spawnEntity.getComponent<EntityComponent.PlayerSpawn>().foundedRealm) {
            SettlementValidation.validate(gameState, command.location, command.playerId)
        } else {
            SettlementValidation.validateFirst(gameState, command.location, command.playerId)
        }
        if (!valid) {
            throw IllegalArgumentException("Invalid settlement command")
        }

        // create settlement
        val tile = gameState.tiles.first { it.position == command.location }
        val settlement = Entity(
            id = Entity.Id(),
            owner = command.playerId,
            components = listOf(
                EntityComponent.Position(tile = tile.ref()),
                EntityComponent.Settlement(name = command.name.trim(), isRealmCapital = true),
                EntityComponent.Vision(radius = 2),
                EntityComponent.Control(radius = 4, amount = 10f)
            )
        )
        gameState.entities.add(settlement)

        // mark spawn as has "founded realm"
        spawnEntity.getComponent<EntityComponent.PlayerSpawn>().foundedRealm = true

        // mark tiles as discovered
        tile.position.iterateCircle(2) { pos ->
            gameState.tiles.find { it.position == pos }?.also {
                it.political.discoveredBy.add(command.playerId)
            }
        }

        // add control to tiles
        val control = settlement.getComponent<EntityComponent.Control>();
        tile.position.iterateCircle(control.radius) { pos ->
            gameState.tiles.find { it.position == pos }?.also {
                it.political.control.add(
                    Tile.ControlEntry(
                        player = command.playerId,
                        settlement = settlement.id,
                        amount = control.amount * (1f - (it.position.distance(tile.position).toFloat() / control.radius.toFloat())),
                    )
                )
            }
        }

    }
}
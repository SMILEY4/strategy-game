package io.github.smiley4.strategygame.engine.simulation.turn.commands

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

        val realm = gameState.realms.first { it.user == command.playerId }

        val spawnEntity = gameState.entities.first { it.hasComponent<EntityComponent.PlayerSpawn>() && it.owner == realm.id }

        val validation = SettlementValidation.evaluate(gameState, command.location, realm.id)
        if (validation == null || !validation.valid) {
            throw IllegalArgumentException("Invalid settlement command")
        }

        // create settlement
        val targetTile = validation.tile
        val settlement = Entity(
            id = Entity.Id(),
            owner = realm.id,
            components = listOf(
                EntityComponent.Position(tile = targetTile.ref()),
                EntityComponent.Settlement(name = command.name.trim(), isRealmCapital = true),
                EntityComponent.Vision(radius = 2),
                EntityComponent.Control(radius = 4, amount = 10f)
            )
        )
        gameState.entities.add(settlement)

        // The realm now follows the established-settlement rules.
        spawnEntity.getComponent<EntityComponent.PlayerSpawn>().hasSettlement = true

        // mark tiles as discovered
        targetTile.position.iterateCircle(2) { pos ->
            gameState.tiles.find { it.position == pos }?.also {
                it.political.discoveredBy.add(realm.id)
            }
        }

        // add control to tiles
        val control = settlement.getComponent<EntityComponent.Control>();
        targetTile.position.iterateCircle(control.radius) { pos ->
            gameState.tiles.find { it.position == pos }?.also {
                it.political.control.add(
                    Tile.ControlEntry(
                        realm = realm.id,
                        entity = settlement.id,
                        amount = control.amount * (1f - (it.position.distance(targetTile.position).toFloat() / control.radius.toFloat())),
                    )
                )
            }
        }

    }
}

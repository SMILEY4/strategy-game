package io.github.smiley4.strategygame.engine.simulation.turn.commands

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.distance
import io.github.smiley4.strategygame.engine.simulation.gamestate.iterateCircle
import io.github.smiley4.strategygame.engine.simulation.turn.tools.TileImprovementValidation

internal class CreateTileImprovementCommandHandler : CommandHandler<PlayerCommand.CreateTileImprovement> {

    override val commandType = PlayerCommand.CreateTileImprovement::class

    override fun handle(gameState: GameStateContext, command: PlayerCommand.CreateTileImprovement) {

        val realm = gameState.realms.first { it.user == command.playerId }
        val targetTile = gameState.tiles.first { it.position == command.location }
        val settlement = gameState.entities.first { it.id == command.settlement && it.hasComponent<EntityComponent.Settlement>() }

        // validate
        if (!TileImprovementValidation.validate(gameState, command.location, realm.id)) {
            throw IllegalArgumentException("Invalid tile-improvement command")
        }

        // create tile improvement
        val tileImprovement = Entity(
            id = Entity.Id(),
            owner = realm.id,
            components = listOf(
                EntityComponent.Position(tile = targetTile.ref()),
                EntityComponent.Vision(radius = 1),
                EntityComponent.Control(radius = 1, amount = 3f),
                EntityComponent.TileImprovement(administeringSettlement = settlement.id),
            )
        )
        gameState.entities.add(tileImprovement)

        // mark tiles as discovered
        targetTile.position.iterateCircle(1) { pos ->
            gameState.tiles.find { it.position == pos }?.also {
                it.political.discoveredBy.add(realm.id)
            }
        }

        // add control to tiles
        val control = tileImprovement.getComponent<EntityComponent.Control>();
        targetTile.position.iterateCircle(control.radius) { pos ->
            gameState.tiles.find { it.position == pos }?.also {
                it.political.control.add(
                    Tile.ControlEntry(
                        realm = realm.id,
                        settlement = settlement.id,
                        entity = tileImprovement.id,
                        amount = control.amount * (1f - (it.position.distance(targetTile.position).toFloat() / control.radius.toFloat())),
                    )
                )
            }
        }

    }
}

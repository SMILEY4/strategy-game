package io.github.smiley4.strategygame.engine.simulation.turn.commands

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation

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
                    EntityComponent.Settlement(command.name.trim(), true)
                )
            )
        )

        // mark spawn as "founded capital"
        gameState.entities.find { it.hasComponent<EntityComponent.PlayerSpawn>() && it.owner == command.playerId }?.also {
            it.getComponent<EntityComponent.PlayerSpawn>().foundedCapital = true
        }

    }
}
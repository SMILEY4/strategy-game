package io.github.smiley4.strategygame.engine.simulation.turn.commands

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.engine.simulation.gamestate.RealmPhase
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.distance
import io.github.smiley4.strategygame.engine.simulation.gamestate.iterateCircle
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation

internal class CreateSettlementCommandHandler : CommandHandler<PlayerCommand.CreateSettlement> {

    override val commandType = PlayerCommand.CreateSettlement::class

    override fun handle(gameState: GameStateContext, command: PlayerCommand.CreateSettlement) {

        val realm = gameState.realms.first { it.user == command.playerId }
        val targetTile = gameState.tiles.first { it.position == command.location }

        // validate
        if (!SettlementValidation.validate(gameState, command.location, realm.id)) {
            throw IllegalArgumentException("Invalid settlement command")
        }

        // create settlement
        val settlement = Entity(
            id = Entity.Id(),
            owner = realm.id,
            components = listOf(
                EntityComponent.Position(tile = targetTile.ref()),
                EntityComponent.Settlement(name = command.name.trim(), isRealmCapital = true),
                EntityComponent.Vision(radius = 2),
                EntityComponent.Control(amount = 6f)
            )
        )
        gameState.entities.add(settlement)

        // set realm phase
        realm.phase = RealmPhase.ESTABLISHED

        // mark tiles as discovered
        val vision = settlement.getComponent<EntityComponent.Vision>();
        targetTile.position.iterateCircle(vision.radius) { pos ->
            gameState.tiles.find { it.position == pos }?.also {
                it.political.discoveredBy.add(realm.id)
            }
        }

        // mark tile immediately as owned
        targetTile.political.ownerRealm = realm.id

    }
}

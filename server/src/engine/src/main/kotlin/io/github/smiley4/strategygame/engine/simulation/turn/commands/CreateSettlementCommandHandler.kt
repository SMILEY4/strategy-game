package io.github.smiley4.strategygame.engine.simulation.turn.commands

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.engine.simulation.gamestate.RealmPhase
import io.github.smiley4.strategygame.engine.simulation.turn.tools.SettlementValidation

internal class CreateSettlementCommandHandler(
    private val settlementValidation: SettlementValidation,
) : CommandHandler<PlayerCommand.CreateSettlement> {

    override val commandType = PlayerCommand.CreateSettlement::class

    override fun handle(gameState: GameStateContext, command: PlayerCommand.CreateSettlement) {

        val realm = gameState.realms.first { it.user == command.playerId }
        val targetTile = gameState.tiles.first { it.position == command.location }

        // validate
        val validationResult = settlementValidation.validate(gameState, command.location, realm.id)
        if (validationResult != null) {
            throw IllegalArgumentException("Invalid settlement command : $validationResult")
        }

        // create settlement
        val settlement = Entity(
            id = Entity.Id(),
            owner = realm.id,
            components = listOf(
                EntityComponent.Position(tile = targetTile.ref()),
                EntityComponent.Settlement(name = command.name.trim(), isRealmCapital = true),
                EntityComponent.Control(amount = 6f)
            )
        )
        gameState.entities.add(settlement)

        // set realm phase
        realm.phase = RealmPhase.ESTABLISHED

        // mark tile immediately as owned
        targetTile.political.ownerRealm = realm.id

    }
}

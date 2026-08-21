package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.shared.values.UserId

object SettlementValidation {

    fun validate(gameState: GameStateContext, location: HexPosition, player: UserId): Boolean {

        // tile must exist
        val tile = gameState.tiles
            .find { it.position == location }
            ?: return false

        // remaining validations
        if (!validate(gameState, tile, player)) {
            return false
        }

        return true
    }

    fun validate(gameState: GameStateContext, tile: Tile, player: UserId): Boolean {

        // player must have discovered tile
        if (player !in tile.discoveredBy) {
            return false
        }

        // tile must be valid terrain (no ocean or mountains)
        if (tile.world.biome == Tile.Biome.OCEAN || tile.world.elevation == Tile.Elevation.MOUNTAINS) {
            return false
        }

        return true
    }

    fun validateCapital(gameState: GameStateContext, location: HexPosition, player: UserId): Boolean {

        // spawn entity must exist and not have founded a capital yet
        val spawn = gameState.entities.find { it.hasComponent<EntityComponent.PlayerSpawn>() && it.owner == player }
        if (spawn == null || spawn.getComponent<EntityComponent.PlayerSpawn>().foundedCapital) {
            return false
        }

        return validate(gameState, location, player)
    }


    fun validateCapital(gameState: GameStateContext, tile: Tile, player: UserId): Boolean {

        // spawn entity must exist and not have founded a capital yet
        val spawn = gameState.entities.find { it.hasComponent<EntityComponent.PlayerSpawn>() && it.owner == player }
        if (spawn == null || spawn.getComponent<EntityComponent.PlayerSpawn>().foundedCapital) {
            return false
        }

        return validate(gameState, tile, player)
    }

}
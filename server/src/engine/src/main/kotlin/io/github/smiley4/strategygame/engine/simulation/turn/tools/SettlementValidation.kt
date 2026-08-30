package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.shared.values.UserId

internal object SettlementValidation {

    fun validateFirst(gameState: GameStateContext, location: HexPosition, player: UserId): Boolean {

        // tile must exist
        val tile = gameState.tiles
            .find { it.position == location }
            ?: return false

        return validateFirst(gameState, tile, player)
    }

    fun validateFirst(gameState: GameStateContext, tile: Tile, player: UserId): Boolean {

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

    fun validateFirst(gameState: GameStateContext, tile: Tile): Boolean {

        // tile must be valid terrain (no ocean or mountains)
        if (tile.world.biome == Tile.Biome.OCEAN || tile.world.elevation == Tile.Elevation.MOUNTAINS) {
            return false
        }

        return true
    }

    fun validate(gameState: GameStateContext, location: HexPosition, player: UserId): Boolean {

        // tile must exist
        val tile = gameState.tiles
            .find { it.position == location }
            ?: return false

        return validate(gameState, tile, player)
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

        // tile must not have settlement on it already
        val occupied = gameState.entities.any {
            it.hasComponent<EntityComponent.Settlement>() && it.getComponentOrNull<EntityComponent.Position>()?.tile?.id == tile.id
        }
        if (occupied) {
            return false
        }

        return true
    }

}
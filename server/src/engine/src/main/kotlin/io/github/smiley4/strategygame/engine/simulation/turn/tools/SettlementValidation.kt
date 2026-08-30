package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile

internal object SettlementValidation {

    const val SETTLEMENT_REQUIRED_CONTROL = 3f

    fun validateFirst(gameState: GameStateContext, location: HexPosition, realm: Realm.Id): Boolean {

        // tile must exist
        val tile = gameState.tiles
            .find { it.position == location }
            ?: return false

        return validateFirst(gameState, tile, realm)
    }

    fun validateFirst(gameState: GameStateContext, tile: Tile, realm: Realm.Id): Boolean {

        // player must have discovered tile
        if (realm !in tile.political.discoveredBy) {
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

    fun validate(gameState: GameStateContext, location: HexPosition, realm: Realm.Id): Boolean {

        // tile must exist
        val tile = gameState.tiles
            .find { it.position == location }
            ?: return false

        return validate(gameState, tile, realm)
    }


    fun validate(gameState: GameStateContext, tile: Tile, realm: Realm.Id): Boolean {

        // player must have discovered tile
        if (realm !in tile.political.discoveredBy) {
            return false
        }

        // player must have control in tile
        val control = tile.political.control.filter { it.realm == realm }.sumOf { it.amount.toDouble() }
        if (control < SETTLEMENT_REQUIRED_CONTROL) {
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
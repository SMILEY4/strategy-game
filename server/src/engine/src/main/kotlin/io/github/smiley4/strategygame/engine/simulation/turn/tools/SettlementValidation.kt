package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.GameSettings
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.RealmPhase
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile

internal class SettlementValidation(private val settings: GameSettings) {

    enum class FailureReason {
        TILE_NOT_DISCOVERED,
        INSUFFICIENT_CONTROL,
        INVALID_TERRITORY,
        ALREADY_OCCUPIED,
        INVALID_TERRAIN,
    }

    fun validate(gameState: GameStateContext, position: HexPosition, realm: Realm.Id) =
        validate(gameState, gameState.tiles.find { it.position == position }!!, realm)

    fun validate(gameState: GameStateContext, tile: Tile, realm: Realm.Id): FailureReason? {

        // tile must be discovered
        if (realm !in tile.political.discoveredBy) {
            return FailureReason.TILE_NOT_DISCOVERED
        }

        // tile must not be in foreign territory
        if (tile.political.ownerRealm != null && tile.political.ownerRealm != realm) {
            return FailureReason.INVALID_TERRITORY
        }

        if (gameState.realms.find { it.id == realm }!!.phase == RealmPhase.ESTABLISHED) {

            val realmControl = tile.political.control.values
                .filter { it.realm == realm }
                .sumOf { it.amount.toDouble() }

            // realm must have sufficient control in neutral tile (only in "established" phase"
            if (tile.political.ownerRealm == null && realmControl < settings.settlementRequiredControl) {
                return FailureReason.INSUFFICIENT_CONTROL
            }
        }

        // tile must not be occupied already
        val isOccupied = gameState.entities
            .mapNotNull { it.getComponentOrNull<EntityComponent.Position>() }
            .any { it.tile.id == tile.id }
        if (isOccupied) {
            return FailureReason.ALREADY_OCCUPIED
        }

        // terrain must be valid
        val terrainValidation = validateTerrain(tile)
        if (terrainValidation != null) {
            return terrainValidation
        }

        return null
    }

    fun validateTerrain(tile: Tile): FailureReason? {
        if (tile.world.biome == Tile.Biome.OCEAN) {
            return FailureReason.INVALID_TERRAIN
        }
        if (tile.world.elevation == Tile.Elevation.MOUNTAINS) {
            return FailureReason.INVALID_TERRAIN
        }
        return null
    }

}

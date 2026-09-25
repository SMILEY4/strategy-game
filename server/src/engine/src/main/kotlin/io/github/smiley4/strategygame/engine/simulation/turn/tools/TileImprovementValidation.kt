package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.GameSettings
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.RealmPhase
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.TileImprovementKey


internal class TileImprovementValidation(private val registry: TileImprovementRegistry, private val settings: GameSettings) {

    enum class FailureReason {
        INVALID_REALM_PHASE,
        TILE_NOT_DISCOVERED,
        INSUFFICIENT_CONTROL,
        INVALID_TERRITORY,
        ALREADY_OCCUPIED,
        TILE_IMPROVEMENT_REQUIREMENTS_NOT_MET,
    }

    fun validate(gameState: GameStateContext, position: HexPosition, realm: Realm.Id, tileImprovementKey: TileImprovementKey) =
        validate(gameState, gameState.tiles.find { it.position == position }!!, realm, tileImprovementKey)


    fun validate(gameState: GameStateContext, tile: Tile, realm: Realm.Id, tileImprovementKey: TileImprovementKey): FailureReason? {
        val resultConstructionLocation = validateConstructionLocation(gameState, tile, realm)
        if (resultConstructionLocation != null) {
            return resultConstructionLocation
        }
        val tileMeetsRequirements = registry.get(tileImprovementKey)?.isBuildableOn(tile) ?: false
        if (!tileMeetsRequirements) {
            return FailureReason.TILE_IMPROVEMENT_REQUIREMENTS_NOT_MET
        }
        return null
    }

    fun validateConstructionLocation(gameState: GameStateContext, tile: Tile, realm: Realm.Id): FailureReason? {

        // tile must be discovered
        if (realm !in tile.political.discoveredBy) {
            return FailureReason.TILE_NOT_DISCOVERED
        }

        // realm must be in "established" phase
        if (gameState.realms.find { it.id == realm }!!.phase != RealmPhase.ESTABLISHED) {
            return FailureReason.INVALID_REALM_PHASE
        }

        // tile must not be in foreign territory
        if (tile.political.ownerRealm != null && tile.political.ownerRealm != realm) {
            return FailureReason.INVALID_TERRITORY
        }

        val realmControl = tile.political.control.values
            .filter { it.realm == realm }
            .sumOf { it.amount.toDouble() }

        // realm must have sufficient control in neutral tile
        if (tile.political.ownerRealm == null && realmControl < settings.tileImprovementRequiredControl) {
            return FailureReason.INSUFFICIENT_CONTROL
        }

        // tile must not be occupied already
        val isOccupied = gameState.entities
            .mapNotNull { it.getComponentOrNull<EntityComponent.Position>() }
            .any { it.tile.id == tile.id }
        if (isOccupied) {
            return FailureReason.ALREADY_OCCUPIED
        }

        return null
    }

    fun getValidForTile(tile: Tile): Set<TileImprovementKey> {
        return registry.getAll()
            .filter { it.isBuildableOn(tile) }
            .map { it.key }
            .toSet()
    }
}

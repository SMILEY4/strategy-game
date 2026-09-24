package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.RealmPhase
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.TileImprovementKey

internal data class TileImprovementValidationResult(
    val validRealm: Boolean,
    val availableImprovementKeys: List<TileImprovementKey>,
) {
    val valid: Boolean
        get() = validRealm && availableImprovementKeys.isNotEmpty()
}

internal object TileImprovementValidation {

    const val REQUIRED_CONTROL = 0f
    private val registry = TileImprovementRegistry()

    fun validate(
        gameState: GameStateContext,
        location: HexPosition,
        realm: Realm.Id,
        improvementKey: TileImprovementKey,
    ): Boolean {
        val tile = gameState.tiles.find { it.position == location } ?: return false
        return inspect(gameState, tile, realm).let { result ->
            result.validRealm && improvementKey in result.availableImprovementKeys
        }
    }

    fun inspect(gameState: GameStateContext, tile: Tile, realm: Realm.Id): TileImprovementValidationResult {
        val phase = gameState.realms.first { it.id == realm }.phase
        val validRealm = isValidRealm(tile, realm, phase)
        val availableImprovementKeys = if (isOccupied(gameState, tile)) {
            emptyList()
        } else {
            registry.getAll()
                .filter { it.isBuildableOn(tile) }
                .map { it.key }
        }
        return TileImprovementValidationResult(
            validRealm = validRealm,
            availableImprovementKeys = availableImprovementKeys,
        )
    }

    private fun isOccupied(gameState: GameStateContext, tile: Tile): Boolean {
        return gameState.entities.any {
            it.getComponentOrNull<EntityComponent.Position>()?.tile?.id == tile.id
        }
    }

    private fun isValidRealm(
        tile: Tile,
        realm: Realm.Id,
        phase: RealmPhase,
    ): Boolean {
        if (realm !in tile.political.discoveredBy) return false
        if (phase != RealmPhase.ESTABLISHED) return false

        val realmControl = tile.political.control.values
            .filter { it.realm == realm }
            .sumOf { it.amount.toDouble() }

        return realmControl > REQUIRED_CONTROL
    }
}

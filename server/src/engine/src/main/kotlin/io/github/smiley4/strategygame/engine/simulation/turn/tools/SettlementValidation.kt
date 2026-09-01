package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile

internal enum class SettlementPhase {
    FOUNDING,
    ESTABLISHED,
}

internal data class SettlementValidationResult(
    val tile: Tile,
    val phase: SettlementPhase,
    val validLocation: Boolean,
    val validRealm: Boolean,
) {
    val valid: Boolean
        get() = validLocation && validRealm
}

internal object SettlementValidation {

    const val SETTLEMENT_REQUIRED_CONTROL = 3f

    fun phase(gameState: GameStateContext, realm: Realm.Id): SettlementPhase {
        val hasSettlement = gameState.entities
            .firstOrNull { it.owner == realm && it.hasComponent<EntityComponent.PlayerSpawn>() }
            ?.getComponent<EntityComponent.PlayerSpawn>()
            ?.hasSettlement == true
        return if (hasSettlement) SettlementPhase.ESTABLISHED else SettlementPhase.FOUNDING
    }

    fun evaluate(
        gameState: GameStateContext,
        location: HexPosition,
        realm: Realm.Id,
    ): SettlementValidationResult? {
        val tile = gameState.tiles.find { it.position == location } ?: return null
        return evaluate(gameState, tile, realm)
    }

    fun evaluate(
        gameState: GameStateContext,
        tile: Tile,
        realm: Realm.Id,
    ): SettlementValidationResult {
        val phase = phase(gameState, realm)
        return SettlementValidationResult(
            tile = tile,
            phase = phase,
            validLocation = isValidLocation(gameState, tile),
            validRealm = isValidRealm(tile, realm, phase),
        )
    }

    /** Returns whether a tile can be used as a settlement site independently of a realm. */
    fun isSuitableSite(tile: Tile): Boolean {
        return tile.world.biome != Tile.Biome.OCEAN && tile.world.elevation != Tile.Elevation.MOUNTAINS
    }

    private fun isValidLocation(gameState: GameStateContext, tile: Tile): Boolean {
        if (!isSuitableSite(tile)) return false

        return gameState.entities.none {
            it.hasComponent<EntityComponent.Settlement>() &&
                it.getComponentOrNull<EntityComponent.Position>()?.tile?.id == tile.id
        }
    }

    private fun isValidRealm(
        tile: Tile,
        realm: Realm.Id,
        phase: SettlementPhase,
    ): Boolean {
        if (realm !in tile.political.discoveredBy) return false
        if (phase == SettlementPhase.FOUNDING) return true

        val control = tile.political.control
            .filter { it.realm == realm }
            .sumOf { it.amount.toDouble() }
        return control >= SETTLEMENT_REQUIRED_CONTROL
    }
}

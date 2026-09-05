package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.RealmPhase
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile

internal data class SettlementValidationResult(
    val validLocation: Boolean,
    val validRealm: Boolean,
) {
    val valid: Boolean
        get() = validLocation && validRealm
}

internal object SettlementValidation {

    const val SETTLEMENT_REQUIRED_CONTROL = 3f

    fun validate(gameState: GameStateContext, location: HexPosition, realm: Realm.Id): Boolean {
        val tile = gameState.tiles.find { it.position == location } ?: return false
        return inspect(gameState, tile, realm).valid
    }

    fun inspect(gameState: GameStateContext, tile: Tile, realm: Realm.Id): SettlementValidationResult {
        val phase = gameState.realms.first { it.id == realm }.phase
        return SettlementValidationResult(
            validLocation = isValidLocation(gameState, tile),
            validRealm = isValidRealm(tile, realm, phase),
        )
    }

    fun isTerrainSuitable(tile: Tile): Boolean {
        return tile.world.biome != Tile.Biome.OCEAN && tile.world.elevation != Tile.Elevation.MOUNTAINS
    }

    private fun isValidLocation(gameState: GameStateContext, tile: Tile): Boolean {
        if (!isTerrainSuitable(tile)) return false

        return gameState.entities.none {
            it.hasComponent<EntityComponent.Settlement>() &&
                it.getComponentOrNull<EntityComponent.Position>()?.tile?.id == tile.id
        }
    }

    private fun isValidRealm(
        tile: Tile,
        realm: Realm.Id,
        phase: RealmPhase,
    ): Boolean {
        if (realm !in tile.political.discoveredBy) return false
        if (phase == RealmPhase.FOUNDING) return true

        val control = tile.political.control
            .filter { it.realm == realm }
            .sumOf { it.amount.toDouble() }
        return control >= SETTLEMENT_REQUIRED_CONTROL
    }
}

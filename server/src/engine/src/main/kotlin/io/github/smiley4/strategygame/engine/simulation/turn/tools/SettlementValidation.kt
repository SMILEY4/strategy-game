package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.GameSettings
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

    fun validate(settings: GameSettings, gameState: GameStateContext, location: HexPosition, realm: Realm.Id): Boolean {
        val tile = gameState.tiles.find { it.position == location } ?: return false
        return inspect(settings, gameState, tile, realm).valid
    }

    fun inspect(settings: GameSettings, gameState: GameStateContext, tile: Tile, realm: Realm.Id): SettlementValidationResult {
        val phase = gameState.realms.first { it.id == realm }.phase
        return SettlementValidationResult(
            validLocation = isValidLocation(gameState, tile),
            validRealm = isValidRealm(settings, tile, realm, phase),
        )
    }

    private fun isValidLocation(gameState: GameStateContext, tile: Tile): Boolean {
        if (!isTerrainSuitable(tile)) return false

        return gameState.entities.none {
            it.getComponentOrNull<EntityComponent.Position>()?.tile?.id == tile.id
        }
    }

    fun isTerrainSuitable(tile: Tile): Boolean {
        return tile.world.biome != Tile.Biome.OCEAN && tile.world.elevation != Tile.Elevation.MOUNTAINS
    }

    private fun isValidRealm(
        settings: GameSettings,
        tile: Tile,
        realm: Realm.Id,
        phase: RealmPhase,
    ): Boolean {
        if (realm !in tile.political.discoveredBy) return false
        if (phase == RealmPhase.FOUNDING) return true

        val realmControl = tile.political.control.values
            .filter { it.realm == realm }
            .sumOf { it.amount.toDouble() }

        return realmControl >= settings.settlementRequiredControl
    }
}

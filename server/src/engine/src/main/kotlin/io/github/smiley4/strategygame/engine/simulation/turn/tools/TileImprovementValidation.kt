package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.RealmPhase
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile

internal data class TileImprovementValidationResult(
    val validLocation: Boolean,
    val validRealm: Boolean,
) {
    val valid: Boolean
        get() = validLocation && validRealm
}

internal object TileImprovementValidation {

    const val REQUIRED_CONTROL = 0f

    fun validate(gameState: GameStateContext, location: HexPosition, realm: Realm.Id): Boolean {
        val tile = gameState.tiles.find { it.position == location } ?: return false
        return inspect(gameState, tile, realm).valid
    }

    fun inspect(gameState: GameStateContext, tile: Tile, realm: Realm.Id): TileImprovementValidationResult {
        val phase = gameState.realms.first { it.id == realm }.phase
        return TileImprovementValidationResult(
            validLocation = isValidLocation(gameState, tile),
            validRealm = isValidRealm(tile, realm, phase),
        )
    }

    private fun isValidLocation(gameState: GameStateContext, tile: Tile): Boolean {
        if (!isTerrainSuitable(tile)) return false

        return gameState.entities.none {
            it.getComponentOrNull<EntityComponent.Position>()?.tile?.id == tile.id
        }
    }

    fun isTerrainSuitable(tile: Tile): Boolean {
        return tile.world.biome != Tile.Biome.OCEAN
    }

    private fun isValidRealm(
        tile: Tile,
        realm: Realm.Id,
        phase: RealmPhase,
    ): Boolean {
        if (realm !in tile.political.discoveredBy) return false
        if (phase != RealmPhase.ESTABLISHED) return false

        val control = tile.political.control
            .filter { it.realm == realm }
            .sumOf { it.amount.toDouble() }
        return control >= REQUIRED_CONTROL
    }
}

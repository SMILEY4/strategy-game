package io.github.smiley4.strategygame.engine.simulation.turn.systems

import io.github.smiley4.strategygame.engine.simulation.GameSettings
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile

internal class UpdateTerritorySystem(private val settings: GameSettings) : GameSystem {


    override fun execute(gameState: GameStateContext) {
        gameState.tiles.forEach { tile ->
            update(tile)
        }
    }

    private fun update(tile: Tile) {
        tile.political.ownerRealm
            ?.let { ownerRealm -> updateClaimed(tile, ownerRealm) }
            ?: updateUnclaimed(tile)
        tile.political.conversion
            ?.takeIf { it.progress >= 1f }
            ?.let { conversion ->
                tile.political.ownerRealm = conversion.targetRealm
                tile.political.conversion = null
            }
    }

    private fun updateUnclaimed(tile: Tile) {
        val claimingRealm = findClaimingRealm(getControlByRealm(tile))
        if (claimingRealm == null) {
            tile.political.conversion = null
        } else {
            updateConversion(tile, claimingRealm)
        }
    }

    private fun updateClaimed(tile: Tile, ownerRealm: Realm.Id) {
        val controlByRealm = getControlByRealm(tile)
        val ownerControl = controlByRealm[ownerRealm] ?: -1f
        if (ownerControl < settings.territoryLooseControlThreshold) {
            updateConversion(tile, findClaimingRealm(controlByRealm))
        }
    }

    private fun updateConversion(tile: Tile, targetRealm: Realm.Id?) {
        val conversion = tile.political.conversion
        if (conversion != null && conversion.targetRealm == targetRealm) {
            conversion.progress += 0.25f
        } else {
            tile.political.conversion = Tile.TileConversion(
                targetRealm = targetRealm,
                progress = 0f,
            )
        }
    }

    private fun getControlByRealm(tile: Tile): Map<Realm.Id, Float> {
        return tile.political.control.values.groupingBy { it.realm }
            .fold(0f) { total, control -> total + control.amount }
    }

    private fun findClaimingRealm(controlByRealm: Map<Realm.Id, Float>): Realm.Id? {
        return controlByRealm
            .filterValues { it >= settings.territoryClaimControlThreshold }
            .maxByOrNull { it.value }
            ?.key
    }

}

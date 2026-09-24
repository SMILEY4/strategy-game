package io.github.smiley4.strategygame.engine.simulation.turn.systems

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.Realm
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile

class UpdateTerritorySystem : GameSystem {

    companion object {
        /**
         * if control of owner is less than this value -> start to lose tile
         */
        private const val LOOSE_CONTROL_THRESHOLD = 1f


        /**
         * if control in (unclaimed/available) tile is more than this value -> start to convert tile.
         */
        private const val CLAIM_REQUIRED_CONTROL = 5f
    }

    override fun execute(gameState: GameStateContext) {
        gameState.tiles.forEach { tile ->
            update(tile)
        }
    }

    private fun update(tile: Tile) {
        if (tile.political.ownerRealm == null) {
            updateUnclaimed(tile)
        } else {
            updateClaimed(tile)
        }
        if (tile.political.conversion != null && (tile.political.conversion?.progress ?: 0f) >= 1f) {
            tile.political.ownerRealm = tile.political.conversion?.targetRealm
            tile.political.conversion = null
        }
    }

    private fun updateUnclaimed(tile: Tile) {
        val candidateRealm = getControlByRealm(tile).entries
            .filter { it.value >= CLAIM_REQUIRED_CONTROL }
            .maxByOrNull { it.value }
        if (candidateRealm != null) {
            if (tile.political.conversion != null && tile.political.conversion?.targetRealm == candidateRealm.key) {
                tile.political.conversion!!.progress += 0.25f
            } else {
                tile.political.conversion = Tile.TileConversion(
                    targetRealm = candidateRealm.key,
                    progress = 0f,
                )
            }
        } else {
            tile.political.conversion = null
        }
    }

    private fun updateClaimed(tile: Tile) {
        val controlByRealm = getControlByRealm(tile)
        val ownerControl = controlByRealm[tile.political.ownerRealm] ?: -1f
        if (ownerControl < LOOSE_CONTROL_THRESHOLD) {
            val candidateRealm = getControlByRealm(tile).entries
                .filter { it.value >= CLAIM_REQUIRED_CONTROL }
                .maxByOrNull { it.value }
            if (candidateRealm != null) {
                if (tile.political.conversion != null && tile.political.conversion?.targetRealm == candidateRealm.key) {
                    tile.political.conversion!!.progress += 0.25f
                } else {
                    tile.political.conversion = Tile.TileConversion(
                        targetRealm = candidateRealm.key,
                        progress = 0f,
                    )
                }
            } else {
                if (tile.political.conversion != null && tile.political.conversion?.targetRealm == null) {
                    tile.political.conversion!!.progress += 0.25f
                } else {
                    tile.political.conversion = Tile.TileConversion(
                        targetRealm = null,
                        progress = 0f,
                    )
                }
            }
        }
    }

    private fun getControlByRealm(tile: Tile): Map<Realm.Id, Float> {
        return tile.political.control.values
            .groupBy(
                keySelector = { it.realm },
                valueTransform = { it.amount }
            )
            .mapValues { (_, amounts) -> amounts.sum() }
    }

}


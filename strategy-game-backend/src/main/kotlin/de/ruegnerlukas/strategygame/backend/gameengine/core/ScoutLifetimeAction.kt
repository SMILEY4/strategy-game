package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.common.models.Tile

/**
 * Updates the lifetime of all scouts. If a scout's lifetime runs out, it is removed from the game
 */
class ScoutLifetimeAction(private val gameConfig: GameConfig): Logging {

    fun perform(game: GameExtended) {
        log().debug("Update lifetimes of scouts")
        val scoutsToRemove = mutableMapOf<Tile, MutableList<ScoutTileContent>>()
        game.tiles
            .asSequence()
            .mapNotNull { tile -> getScoutOrNull(tile) }
            .forEach { (tile, scout) -> handleScout(game, tile, scout, scoutsToRemove) }
        log().debug("Removing ${scoutsToRemove.size} at end of lifetime.")
        removeScouts(scoutsToRemove)
    }

    private fun getScoutOrNull(tile: Tile): Pair<Tile, ScoutTileContent>? {
        return tile.content.find { it is ScoutTileContent }?.let { tile to it as ScoutTileContent }
    }

    private fun handleScout(game: GameExtended, tile: Tile, scout: ScoutTileContent, scoutsToRemove: ScoutsToRemove) {
        val lifetime = getTimeAlive(game, scout)
        if (lifetime > gameConfig.scoutLifetime) {
            scoutsToRemove.computeIfAbsent(tile) { mutableListOf() }.add(scout)
        }
    }

    private fun getTimeAlive(game: GameExtended, scout: ScoutTileContent): Int {
        return game.game.turn - scout.turn
    }

    private fun removeScouts(scoutsToRemove: ScoutsToRemove) {
        scoutsToRemove.forEach { (tile, scouts) ->
            tile.content.removeAll(scouts)
        }
    }

}

private typealias ScoutsToRemove = MutableMap<Tile, MutableList<ScoutTileContent>>
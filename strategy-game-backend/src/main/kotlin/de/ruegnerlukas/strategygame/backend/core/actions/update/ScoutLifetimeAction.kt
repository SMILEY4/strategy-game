package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

/**
 * Updates the lifetime of all scouts. If a scout's lifetime runs out, it is removed from the game
 */
class ScoutLifetimeAction(private val gameConfig: GameConfig) {

    fun perform(game: GameExtended) {
        val scoutsToRemove = mutableMapOf<Tile, MutableList<ScoutTileContent>>()
        game.tiles
            .asSequence()
            .mapNotNull { tile -> getScoutOrNull(tile) }
            .forEach { (tile, scout) -> handleScout(game, tile, scout, scoutsToRemove) }
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
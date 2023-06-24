package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.common.models.Tile

/**
 * Updates the lifetime of all scouts. If a scout's lifetime runs out, it is removed from the game
 */
class GENUpdateScoutLifetime(
    private val gameConfig: GameConfig,
    eventSystem: EventSystem
) : Logging {

    object Definition : BasicEventNodeDefinition<GameExtended, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerGlobalUpdate)
            action { game ->
                log().debug("Update lifetimes of scouts")
                val scoutsToRemove = getScoutsToRemove(game)
                log().debug("Removing ${scoutsToRemove.size} at end of lifetime.")
                removeScouts(scoutsToRemove)
                eventResultOk(Unit)
            }
        }
    }

    private fun getScoutsToRemove(game: GameExtended): MutableMap<Tile, MutableList<ScoutTileContent>> {
        val scoutsToRemove = mutableMapOf<Tile, MutableList<ScoutTileContent>>()
        iterateScouts(game) { tile, scout ->
            handleScout(game, tile, scout, scoutsToRemove)
        }
        return scoutsToRemove
    }

    private fun iterateScouts(game: GameExtended, consumer: (tile: Tile, scout: ScoutTileContent) -> Unit) {
        game.tiles
            .asSequence()
            .mapNotNull { tile -> getScoutOrNull(tile) }
            .forEach { (tile, scout) -> consumer(tile, scout) }
    }

    private fun getScoutOrNull(tile: Tile): Pair<Tile, ScoutTileContent>? {
        return tile.content.find { it is ScoutTileContent }?.let { tile to it as ScoutTileContent }
    }

    private fun handleScout(
        game: GameExtended,
        tile: Tile,
        scout: ScoutTileContent,
        scoutsToRemove: MutableMap<Tile, MutableList<ScoutTileContent>>
    ) {
        val lifetime = getTimeAlive(game, scout)
        if (lifetime > gameConfig.scoutLifetime) {
            scoutsToRemove.computeIfAbsent(tile) { mutableListOf() }.add(scout)
        }
    }

    private fun getTimeAlive(game: GameExtended, scout: ScoutTileContent): Int {
        return game.game.turn - scout.turn
    }

    private fun removeScouts(scoutsToRemove: MutableMap<Tile, MutableList<ScoutTileContent>>) {
        scoutsToRemove.forEach { (tile, scouts) ->
            tile.content.removeAll(scouts)
        }
    }

}
package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ScoutTileObject
import io.github.smiley4.strategygame.backend.commondata.Tile


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

    private fun getScoutsToRemove(game: GameExtended): MutableMap<Tile, MutableList<ScoutTileObject>> {
        val scoutsToRemove = mutableMapOf<Tile, MutableList<ScoutTileObject>>()
        iterateScouts(game) { tile, scout ->
            handleScout(game, tile, scout, scoutsToRemove)
        }
        return scoutsToRemove
    }

    private fun iterateScouts(game: GameExtended, consumer: (tile: Tile, scout: ScoutTileObject) -> Unit) {
        game.tiles
            .asSequence()
            .mapNotNull { tile -> getScoutOrNull(tile) }
            .forEach { (tile, scout) -> consumer(tile, scout) }
    }

    private fun getScoutOrNull(tile: Tile): Pair<Tile, ScoutTileObject>? {
        return tile.findOneObject<ScoutTileObject>()?.let { tile to it }
    }

    private fun handleScout(
        game: GameExtended,
        tile: Tile,
        scout: ScoutTileObject,
        scoutsToRemove: MutableMap<Tile, MutableList<ScoutTileObject>>
    ) {
        val lifetime = getTimeAlive(game, scout)
        if (lifetime > gameConfig.scoutLifetime) {
            scoutsToRemove.computeIfAbsent(tile) { mutableListOf() }.add(scout)
        }
    }

    private fun getTimeAlive(game: GameExtended, scout: ScoutTileObject): Int {
        return game.meta.turn - scout.creationTurn
    }

    private fun removeScouts(scoutsToRemove: Map<Tile, List<ScoutTileObject>>) {
        scoutsToRemove.forEach { (tile, scouts) ->
            tile.objects.removeAll(scouts)
        }
    }

}
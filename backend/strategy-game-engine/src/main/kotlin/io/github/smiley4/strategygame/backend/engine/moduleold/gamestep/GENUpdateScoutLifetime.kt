package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ScoutWorldObject
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

    private fun getScoutsToRemove(game: GameExtended): MutableMap<Tile, MutableList<ScoutWorldObject>> {
        val scoutsToRemove = mutableMapOf<Tile, MutableList<ScoutWorldObject>>()
        iterateScouts(game) { tile, scout ->
            handleScout(game, tile, scout, scoutsToRemove)
        }
        return scoutsToRemove
    }

    private fun iterateScouts(game: GameExtended, consumer: (tile: Tile, scout: ScoutWorldObject) -> Unit) {
        game.tiles
            .asSequence()
            .mapNotNull { tile -> getScoutOrNull(tile) }
            .forEach { (tile, scout) -> consumer(tile, scout) }
    }

    private fun getScoutOrNull(tile: Tile): Pair<Tile, ScoutWorldObject>? {
        return tile.findOneObject<ScoutWorldObject>()?.let { tile to it }
    }

    private fun handleScout(
        game: GameExtended,
        tile: Tile,
        scout: ScoutWorldObject,
        scoutsToRemove: MutableMap<Tile, MutableList<ScoutWorldObject>>
    ) {
        val lifetime = getTimeAlive(game, scout)
        if (lifetime > gameConfig.scoutLifetime) {
            scoutsToRemove.computeIfAbsent(tile) { mutableListOf() }.add(scout)
        }
    }

    private fun getTimeAlive(game: GameExtended, scout: ScoutWorldObject): Int {
        return game.meta.turn - scout.creationTurn
    }

    private fun removeScouts(scoutsToRemove: Map<Tile, List<ScoutWorldObject>>) {
        scoutsToRemove.forEach { (tile, scouts) ->
            tile.objects.removeAll(scouts)
        }
    }

}
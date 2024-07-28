package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ScoutWorldObject
import io.github.smiley4.strategygame.backend.commondata.Tile


/**
 * Adds the scout at the given location and discovers the surrounding tiles
 */
class GENPlaceScout(private val gameConfig: GameConfig, eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<PlaceScoutOperationData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENValidatePlaceScout.Definition.after())
            action { data ->
                log().debug("Place scout at ${data.targetTile.position} of country ${data.country.countryId}")
                addScout(data.targetTile, data.country.countryId, data.game.meta.turn)
                discoverTiles(data.game, data.targetTile, data.country.countryId)
                eventResultOk(Unit)
            }
        }
    }


    private fun addScout(tile: Tile, countryId: String, turn: Int) {
//        tile.objects.add(
//            ScoutWorldObject(
//                countryId = countryId,
//                creationTurn = turn,
//            )
//        )
    }

    private fun discoverTiles(game: GameExtended, scoutTile: Tile, countryId: String) {
        positionsCircle(scoutTile.position, gameConfig.scoutVisibilityRange)
            .asSequence()
            .mapNotNull { game.findTileOrNull(it) }
            .filter { !hasDiscovered(countryId, it) }
            .forEach { it.discoveredByCountries.add(countryId) }
    }

    private fun hasDiscovered(countryId: String, tile: Tile): Boolean {
        return tile.discoveredByCountries.contains(countryId)
    }

}
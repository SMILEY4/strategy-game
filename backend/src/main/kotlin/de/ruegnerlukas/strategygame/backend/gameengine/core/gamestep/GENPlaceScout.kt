package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ScoutTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef

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
        tile.objects.add(
            ScoutTileObject(
                countryId = countryId,
                creationTurn = turn,
            )
        )
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
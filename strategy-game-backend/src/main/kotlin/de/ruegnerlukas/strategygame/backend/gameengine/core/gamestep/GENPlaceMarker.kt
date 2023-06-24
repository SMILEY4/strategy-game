package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.common.models.Tile

/**
 * Adds the marker at the given location
 */
class GENPlaceMarker(eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<PlaceMarkerOperationData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENValidatePlaceMarker.Definition.after())
            action { data ->
                log().debug("Place marker at ${data.targetTile.position} of country ${data.country.countryId}")
                addMarker(data.targetTile, data.country)
                eventResultOk(Unit)
            }
        }
    }

    private fun addMarker(tile: Tile, country: Country) {
        tile.content.add(MarkerTileContent(country.countryId))
    }

}
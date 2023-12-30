package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile

/**
 * Adds the marker at the given location
 */
class GENDeleteMarker(eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<DeleteMarkerOperationData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerResolveDeleteMarker)
            action { data ->
                log().debug("Delete marker at ${data.targetTile.position} of country ${data.country.countryId}")
                deleteMarker(data.targetTile, data.country)
                eventResultOk(Unit)
            }
        }
    }

    private fun deleteMarker(tile: Tile, country: Country) {
        tile.objects.removeIf { it is MarkerTileObject && it.countryId == country.countryId }
    }

}
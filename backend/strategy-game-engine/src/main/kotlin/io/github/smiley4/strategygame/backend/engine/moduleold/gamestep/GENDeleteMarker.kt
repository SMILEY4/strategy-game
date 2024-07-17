package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.MarkerTileObject
import io.github.smiley4.strategygame.backend.commondata.Tile


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
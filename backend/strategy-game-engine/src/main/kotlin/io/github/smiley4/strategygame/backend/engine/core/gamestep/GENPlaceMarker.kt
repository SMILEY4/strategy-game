package io.github.smiley4.strategygame.backend.engine.core.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.common.models.MarkerTileObject
import io.github.smiley4.strategygame.backend.common.models.Tile


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
                addMarker(data.targetTile, data.country, data.label)
                eventResultOk(Unit)
            }
        }
    }

    private fun addMarker(tile: Tile, country: Country, label: String) {
        tile.objects.add(
            MarkerTileObject(
                countryId = country.countryId,
                label = label
            )
        )
    }

}
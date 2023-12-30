package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.EventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.utils.validations
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.MarkerTileObject

class GENValidatePlaceMarker(eventSystem: EventSystem) : Logging {

    object Definition : EventNodeDefinition<PlaceMarkerOperationData, PlaceMarkerOperationData, OperationInvalidData, Unit>()


    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerResolvePlaceMarker)
            action { data ->
                val result = validations {
                    mustBeTrue("MARKER.TILE_SPACE") {
                        data.targetTile.objects.none { it is MarkerTileObject && it.countryId == data.country.countryId }
                    }
                }
                if (result.isInvalid()) {
                    log().info("Invalid operation: placing marker: ${result.getInvalidCodes()}")
                    eventResultCancel(OperationInvalidData(data.game, result.getInvalidCodes()))
                } else {
                    eventResultOk(data)
                }
            }
        }
    }

}
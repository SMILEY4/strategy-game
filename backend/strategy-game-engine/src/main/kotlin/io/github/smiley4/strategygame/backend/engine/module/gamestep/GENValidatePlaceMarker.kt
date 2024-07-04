package io.github.smiley4.strategygame.backend.engine.module.core.gamestep

import io.github.smiley4.strategygame.backend.common.events.EventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.validations
import io.github.smiley4.strategygame.backend.common.models.MarkerTileObject


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
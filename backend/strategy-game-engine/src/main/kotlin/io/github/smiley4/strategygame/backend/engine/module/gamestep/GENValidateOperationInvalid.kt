package io.github.smiley4.strategygame.backend.engine.module.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging


class GENValidateOperationInvalid(eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<OperationInvalidData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(
                GENValidateAddProductionQueueEntry.Definition.cancelled(),
                GENValidateCreateCity.Definition.cancelled(),
                GENValidatePlaceMarker.Definition.cancelled(),
                GENValidatePlaceScout.Definition.cancelled(),
                GENValidateRemoveProductionQueueEntry.Definition.cancelled(),
            )
            action { data ->
                log().info("Validation of operation failed: ${data.codes.joinToString(",")}")
                eventResultOk(Unit)
            }
        }
    }

}
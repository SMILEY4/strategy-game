package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.EventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.validations


class GENValidateAddProductionQueueEntry(eventSystem: EventSystem) : Logging {

    object Definition :
        EventNodeDefinition<AddProductionQueueEntryOperationData, AddProductionQueueEntryOperationData, OperationInvalidData, Unit>()


    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerResolveAddProductionQueueEntry)
            action { data ->
                val result = validations {
                    mustBeTrue("ADD_PRODUCTION_QUEUE_ENTRY.CITY_OWNER") {
                        data.city.countryId == data.country.countryId
                    }
                    mustBeTrue("ADD_PRODUCTION_QUEUE_ENTRY.BUILDING.CITY_SPACE") {
                        data.city.tier.buildingSlots -data.city.infrastructure.buildings.size > 0
                    }
                }
                if (result.isInvalid()) {
                    log().info("Invalid operation: ${result.getInvalidCodes()}")
                    eventResultCancel(OperationInvalidData(data.game, result.getInvalidCodes()))
                } else {
                    eventResultOk(data)
                }
            }
        }
    }

}
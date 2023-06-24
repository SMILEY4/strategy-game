package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.EventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.utils.validations

class GENValidateAddProductionQueueEntry(private val gameConfig: GameConfig, eventSystem: EventSystem) : Logging {

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
                        if (data.city.isProvinceCapital) {
                            (gameConfig.cityBuildingSlots - data.city.buildings.size) > 0
                        } else {
                            (gameConfig.townBuildingSlots - data.city.buildings.size) > 0
                        }
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
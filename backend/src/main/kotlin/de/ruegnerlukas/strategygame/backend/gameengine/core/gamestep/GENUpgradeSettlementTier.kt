package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging

/**
 * Upgrade the given settlement to the given settlement tier
 */
class GENUpgradeSettlementTier(eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<UpgradeSettlementTierOperationData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENValidateUpgradeSettlementTier.Definition.after())
            action { data ->
                log().debug("upgrading settlement-tier of city ${data.city.cityId} to ${data.targetTier}")
                data.city.tier = data.targetTier
                eventResultOk(Unit)
            }
        }
    }

}
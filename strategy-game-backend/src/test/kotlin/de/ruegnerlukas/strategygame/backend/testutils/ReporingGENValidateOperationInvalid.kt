package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateAddProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidatePlaceMarker
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidatePlaceScout
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateRemoveProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateUpgradeSettlementTier
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.OperationInvalidData
import de.ruegnerlukas.strategygame.backend.testutils.TestActions.Companion.TestActionContext

class GENReportOperationInvalid(private val testContext: TestActionContext, eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<OperationInvalidData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(
                GENValidateAddProductionQueueEntry.Definition.cancelled(),
                GENValidateCreateCity.Definition.cancelled(),
                GENValidatePlaceMarker.Definition.cancelled(),
                GENValidatePlaceScout.Definition.cancelled(),
                GENValidateRemoveProductionQueueEntry.Definition.cancelled(),
                GENValidateUpgradeSettlementTier.Definition.cancelled(),
            )
            action { data ->
                testContext.commandResolutionErrors[data.game.meta.turn] = data.codes.toList()
                eventResultOk(Unit)
            }
        }
    }

}
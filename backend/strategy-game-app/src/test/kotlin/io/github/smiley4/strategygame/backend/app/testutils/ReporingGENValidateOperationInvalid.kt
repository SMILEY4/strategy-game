package io.github.smiley4.strategygame.backend.app.testutils

import io.github.smiley4.strategygame.backend.app.testutils.TestActions.Companion.TestActionContext
import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateAddProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateCreateCity
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidatePlaceMarker
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidatePlaceScout
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateRemoveProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateUpgradeSettlementTier
import io.github.smiley4.strategygame.backend.engine.core.gamestep.OperationInvalidData


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
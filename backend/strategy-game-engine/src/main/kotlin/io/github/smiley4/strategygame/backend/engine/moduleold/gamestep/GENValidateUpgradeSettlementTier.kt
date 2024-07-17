package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.EventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.validations
import io.github.smiley4.strategygame.backend.commondata.SettlementTier
import io.github.smiley4.strategygame.backend.commondata.nextTier


class GENValidateUpgradeSettlementTier(eventSystem: EventSystem) : Logging {

    object Definition : EventNodeDefinition<UpgradeSettlementTierOperationData, UpgradeSettlementTierOperationData, OperationInvalidData, Unit>()


    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerResolveUpgradeSettlementTier)
            action { data ->
                val result = validations {
                    mustBeTrue("SETTLEMENT_TIER_UPGRADE.TARGET_TIER") {
                        data.targetTier == data.city.tier.nextTier()
                    }
                    mustBeTrue("SETTLEMENT_TIER_UPGRADE.MIN_POP_SIZE") {
                        data.city.population.size >= data.targetTier.minRequiredSize
                    }
                    mustBeTrue("SETTLEMENT_TIER_UPGRADE.ONE_CITY_PER_PROVINCE") {
                        if (data.targetTier == SettlementTier.CITY) {
                            data.city
                                .findProvince(data.game)
                                .findCities(data.game)
                                .none { it.tier == SettlementTier.CITY }
                        } else {
                            true
                        }
                    }
                }
                if (result.isInvalid()) {
                    log().info("Invalid operation: upgrading city tier: ${result.getInvalidCodes()}")
                    eventResultCancel(OperationInvalidData(data.game, result.getInvalidCodes()))
                } else {
                    eventResultOk(data)
                }
            }
        }
    }

}
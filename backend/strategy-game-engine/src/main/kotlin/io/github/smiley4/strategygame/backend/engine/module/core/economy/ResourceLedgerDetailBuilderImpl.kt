package io.github.smiley4.strategygame.backend.engine.module.core.economy

import io.github.smiley4.strategygame.backend.commondata.DetailLogValue
import io.github.smiley4.strategygame.backend.commondata.FloatDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.ResourceLedgerDetailType
import io.github.smiley4.strategygame.backend.commondata.TextDetailLogValue
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.module.ledger.ResourceLedgerDetailBuilder
import io.github.smiley4.strategygame.backend.engine.module.core.economy.entity.BuildingEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.core.economy.entity.GameEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.core.economy.entity.PopulationBaseEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.core.economy.entity.PopulationGrowthEconomyEntity
import io.github.smiley4.strategygame.backend.engine.module.core.economy.entity.ProductionQueueEconomyEntity

internal class ResourceLedgerDetailBuilderImpl : ResourceLedgerDetailBuilder {

    override fun consume(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        val detailType = when (entity) {
            is GameEconomyEntity -> when (entity) {
                is BuildingEconomyEntity -> ResourceLedgerDetailType.BUILDING_CONSUMPTION
                is PopulationBaseEconomyEntity -> ResourceLedgerDetailType.POPULATION_BASE_CONSUMPTION
                is PopulationGrowthEconomyEntity -> ResourceLedgerDetailType.POPULATION_GROWTH_CONSUMPTION
                is ProductionQueueEconomyEntity -> ResourceLedgerDetailType.PRODUCTION_QUEUE_CONSUMPTION
            }
            else -> ResourceLedgerDetailType.UNKNOWN_CONSUMPTION
        }
        return buildDetail(detailType) { details ->
            if (entity is GameEconomyEntity) {
                details["group"] = TextDetailLogValue("consume")
                details["key"] = TextDetailLogValue(entity.detailKey())
                details["amount"] = FloatDetailLogValue(amount)
            }
        }
    }

    override fun produce(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        val detailType = when (entity) {
            is GameEconomyEntity -> when (entity) {
                is BuildingEconomyEntity -> ResourceLedgerDetailType.BUILDING_PRODUCTION
                is ProductionQueueEconomyEntity -> ResourceLedgerDetailType.PRODUCTION_QUEUE_REFUND
                else -> ResourceLedgerDetailType.UNKNOWN_CONSUMPTION
            }
            else -> ResourceLedgerDetailType.UNKNOWN_PRODUCTION
        }
        return buildDetail(detailType) { details ->
            if (entity is GameEconomyEntity) {
                details["group"] = TextDetailLogValue("produce")
                details["key"] = TextDetailLogValue(entity.detailKey())
                details["amount"] = FloatDetailLogValue(amount)
            }
        }
    }

    override fun giveShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return buildDetail(ResourceLedgerDetailType.SHARED_GIVE) { details ->
            details["amount"] = FloatDetailLogValue(amount)
            if (entity is GameEconomyEntity) {
                details["group"] = TextDetailLogValue("giveShare")
                details["key"] = TextDetailLogValue(entity.detailKey())
                details["amount"] = FloatDetailLogValue(amount)
            }
        }
    }

    override fun takeShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return buildDetail(ResourceLedgerDetailType.SHARED_TAKE) { details ->
            details["amount"] = FloatDetailLogValue(amount)
            if (entity is GameEconomyEntity) {
                details["group"] = TextDetailLogValue("takeShare")
                details["key"] = TextDetailLogValue(entity.detailKey())
                details["amount"] = FloatDetailLogValue(amount)
            }
        }
    }

    override fun missing(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        val detailType = when (entity) {
            is GameEconomyEntity -> when (entity) {
                is BuildingEconomyEntity -> ResourceLedgerDetailType.BUILDING_MISSING
                is PopulationBaseEconomyEntity -> ResourceLedgerDetailType.POPULATION_BASE_MISSING
                is PopulationGrowthEconomyEntity -> ResourceLedgerDetailType.POPULATION_GROWTH_MISSING
                is ProductionQueueEconomyEntity -> ResourceLedgerDetailType.PRODUCTION_QUEUE_MISSING
            }
            else -> ResourceLedgerDetailType.UNKNOWN_MISSING
        }
        return buildDetail(detailType) { details ->
            if (entity is GameEconomyEntity) {
                details["group"] = TextDetailLogValue("missing")
                details["key"] = TextDetailLogValue(entity.detailKey())
                details["amount"] = FloatDetailLogValue(amount)
            }
        }
    }

    private fun buildDetail(type: ResourceLedgerDetailType, build: (details: MutableMap<String, DetailLogValue>) -> Unit = {}) =
        type to mutableMapOf<String, DetailLogValue>().also(build)

}
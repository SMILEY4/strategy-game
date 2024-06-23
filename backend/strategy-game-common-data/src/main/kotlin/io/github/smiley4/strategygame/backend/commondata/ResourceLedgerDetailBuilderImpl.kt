package io.github.smiley4.strategygame.backend.commondata

import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyEntity
import io.github.smiley4.strategygame.backend.engine.core.eco.entity.BuildingEconomyEntity
import io.github.smiley4.strategygame.backend.engine.core.eco.entity.PopulationBaseEconomyEntity
import io.github.smiley4.strategygame.backend.engine.core.eco.entity.PopulationGrowthEconomyEntity
import io.github.smiley4.strategygame.backend.engine.core.eco.entity.ProductionQueueEconomyEntity


class ResourceLedgerDetailBuilderImpl : ResourceLedgerDetailBuilder {

    override fun consume(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return when (entity) {
            is BuildingEconomyEntity -> buildDetail(ResourceLedgerDetailType.BUILDING_CONSUMPTION) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
                detail["buildingType"] = BuildingTypeDetailLogValue(entity.building.type)
            }
            is PopulationBaseEconomyEntity -> buildDetail(ResourceLedgerDetailType.POPULATION_BASE_CONSUMPTION) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
            }
            is PopulationGrowthEconomyEntity -> buildDetail(ResourceLedgerDetailType.POPULATION_GROWTH_CONSUMPTION) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
            }
            is ProductionQueueEconomyEntity -> buildDetail(ResourceLedgerDetailType.PRODUCTION_QUEUE_CONSUMPTION) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
            }
            else -> buildDetail(ResourceLedgerDetailType.UNKNOWN_CONSUMPTION) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
            }
        }
    }

    override fun produce(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return when (entity) {
            is BuildingEconomyEntity -> buildDetail(ResourceLedgerDetailType.BUILDING_PRODUCTION) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
                detail["buildingType"] = BuildingTypeDetailLogValue(entity.building.type)
            }
            else -> buildDetail(ResourceLedgerDetailType.UNKNOWN_PRODUCTION) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
            }
        }
    }

    override fun giveShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return buildDetail(ResourceLedgerDetailType.SHARED_GIVE) { detail ->
            detail["amount"] = FloatDetailLogValue(amount)
        }
    }

    override fun takeShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return buildDetail(ResourceLedgerDetailType.SHARED_TAKE) { detail ->
            detail["amount"] = FloatDetailLogValue(amount)
        }
    }

    override fun missing(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return when (entity) {
            is BuildingEconomyEntity -> buildDetail(ResourceLedgerDetailType.BUILDING_MISSING) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
                detail["buildingType"] = BuildingTypeDetailLogValue(entity.building.type)
            }
            is PopulationBaseEconomyEntity -> buildDetail(ResourceLedgerDetailType.POPULATION_BASE_MISSING) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
            }
            is PopulationGrowthEconomyEntity -> buildDetail(ResourceLedgerDetailType.POPULATION_GROWTH_MISSING) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
            }
            is ProductionQueueEconomyEntity -> buildDetail(ResourceLedgerDetailType.PRODUCTION_QUEUE_MISSING) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
            }
            else -> buildDetail(ResourceLedgerDetailType.UNKNOWN_MISSING) { detail ->
                detail["amount"] = FloatDetailLogValue(amount)
            }
        }
    }

    private fun buildDetail(type: ResourceLedgerDetailType, build: (details: MutableMap<String, DetailLogValue>) -> Unit) =
        type to mutableMapOf<String, DetailLogValue>().also(build)

}
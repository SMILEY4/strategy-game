package io.github.smiley4.strategygame.backend.engine.module.eco.entity

import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.amount
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.engine.module.eco.EconomyPopFoodConsumptionProvider


class PopulationBaseEconomyEntity(
    override val owner: EconomyNode,
    val city: City,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : GameEconomyEntity {

    companion object {
        private fun getRequiredResources(popFoodConsumption: EconomyPopFoodConsumptionProvider, city: City): ResourceCollection {
            return ResourceCollection.basic(
                ResourceType.FOOD.amount(popFoodConsumption.getRequiredFood(city))
            )
        }
    }

    override val config: EconomyEntityConfig = EconomyEntityConfig(
        input = getRequiredResources(popFoodConsumption, city),
        output = ResourceCollection.empty(),
        consumptionType = EconomyConsumptionType.DISTRIBUTED,
        priority = if (city.meta.isProvinceCapital) 2.5f else 2f,
        isActive = true
    )

    override val state: EconomyEntityUpdateState = EconomyEntityUpdateState(config.input)

}
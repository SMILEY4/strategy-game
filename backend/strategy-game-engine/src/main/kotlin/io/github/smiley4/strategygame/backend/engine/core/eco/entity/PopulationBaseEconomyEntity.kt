package io.github.smiley4.strategygame.backend.engine.core.eco.entity

import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceType
import io.github.smiley4.strategygame.backend.common.models.resources.amount
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyNode
import io.github.smiley4.strategygame.backend.engine.core.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.ports.models.City


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
package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.common.models.resources.amount
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyConsumptionType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntityConfig
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntityUpdateState
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City

class PopulationBaseEconomyEntity(
    override val owner: EconomyNode,
    val city: City,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : EconomyEntity {

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
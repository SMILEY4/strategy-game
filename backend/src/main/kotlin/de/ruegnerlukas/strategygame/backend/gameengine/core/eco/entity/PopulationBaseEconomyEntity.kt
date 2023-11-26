package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.common.models.resources.amount
import de.ruegnerlukas.strategygame.backend.economy.old.prebuild.BasicEconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.old.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City

class PopulationBaseEconomyEntity(
    val owner: EconomyNode,
    val city: City,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : BasicEconomyEntity(
    owner = owner,
    priority = if (city.meta.isProvinceCapital) 2.5f else 2f,
    resourcesInput = getRequiredResources(popFoodConsumption, city),
    allowPartialInput = true,
) {

    companion object {
        private fun getRequiredResources(popFoodConsumption: EconomyPopFoodConsumptionProvider, city: City): ResourceCollection {
            return ResourceCollection.basic(
                ResourceType.FOOD.amount(popFoodConsumption.getRequiredFood(city))
            )
        }
    }

    fun getConsumedFood() = getProvidedResources()[ResourceType.FOOD]


}
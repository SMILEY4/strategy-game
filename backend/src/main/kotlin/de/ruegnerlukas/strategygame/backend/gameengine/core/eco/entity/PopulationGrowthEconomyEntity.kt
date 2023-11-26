package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.common.models.resources.amount
import de.ruegnerlukas.strategygame.backend.economy.old.prebuild.BasicEconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.old.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City

class PopulationGrowthEconomyEntity(
    val owner: EconomyNode,
    val city: City,
    config: GameConfig
) : BasicEconomyEntity(
    owner = owner,
    priority = 0f,
    resourcesInput = getRequiredResources(config),
) {

    companion object {

        private fun getRequiredResources(config: GameConfig): ResourceCollection {
            return ResourceCollection.basic(
                ResourceType.FOOD.amount(config.popGrowthFoodCost)
            )
        }

    }

    fun hasConsumedFood() = completedOutput()

}
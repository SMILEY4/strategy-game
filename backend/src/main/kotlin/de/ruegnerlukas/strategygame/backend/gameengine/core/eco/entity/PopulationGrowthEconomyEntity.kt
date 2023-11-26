package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.common.models.resources.amount
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyConsumptionType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntityConfig
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntityUpdateState
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City


class PopulationGrowthEconomyEntity(
    override val owner: de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode,
    val city: City,
    gameConfig: GameConfig
) : EconomyEntity {

    companion object {
        private fun getRequiredResources(config: GameConfig): ResourceCollection {
            return ResourceCollection.basic(
                ResourceType.FOOD.amount(config.popGrowthFoodCost)
            )
        }
    }

    override val config: EconomyEntityConfig = EconomyEntityConfig(
        input = getRequiredResources(gameConfig),
        output = ResourceCollection.empty(),
        consumptionType = EconomyConsumptionType.LOCAL,
        priority = 0f,
        isActive = true
    )

    override val state: EconomyEntityUpdateState = EconomyEntityUpdateState(config.input)

}
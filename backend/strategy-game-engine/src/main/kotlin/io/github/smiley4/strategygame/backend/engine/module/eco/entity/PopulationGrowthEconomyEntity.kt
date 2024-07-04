package io.github.smiley4.strategygame.backend.engine.module.core.eco.entity

import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceType
import io.github.smiley4.strategygame.backend.common.models.resources.amount
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.engine.ports.models.City


class PopulationGrowthEconomyEntity(
    override val owner: EconomyNode,
    val city: City,
    gameConfig: GameConfig
) : GameEconomyEntity {

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
        consumptionType = EconomyConsumptionType.COMPLETE,
        priority = 0f,
        isActive = true
    )

    override val state: EconomyEntityUpdateState = EconomyEntityUpdateState(config.input)

}
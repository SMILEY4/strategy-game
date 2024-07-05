package io.github.smiley4.strategygame.backend.engine.module.eco.entity

import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.amount
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode


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
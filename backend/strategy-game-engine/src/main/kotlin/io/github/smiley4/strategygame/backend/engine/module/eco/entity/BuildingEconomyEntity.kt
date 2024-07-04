package io.github.smiley4.strategygame.backend.engine.module.core.eco.entity

import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode
import io.github.smiley4.strategygame.backend.engine.ports.models.Building
import io.github.smiley4.strategygame.backend.engine.ports.models.City


class BuildingEconomyEntity(
    override val owner: EconomyNode,
    val city: City,
    val building: Building,
) : GameEconomyEntity {

    companion object {

        private fun fulfillsTileRequirement(building: Building): Boolean {
            return building.type.templateData.requiredTileResource == null || building.tile != null
        }

    }

    override val config: EconomyEntityConfig = EconomyEntityConfig(
        input = ResourceCollection.basic(building.type.templateData.requires),
        output = ResourceCollection.basic(building.type.templateData.produces),
        consumptionType = EconomyConsumptionType.COMPLETE,
        priority = if (city.meta.isProvinceCapital) 1.5f else 1f,
        isActive = fulfillsTileRequirement(building),
    )

    override val state: EconomyEntityUpdateState = EconomyEntityUpdateState(config.input)

}
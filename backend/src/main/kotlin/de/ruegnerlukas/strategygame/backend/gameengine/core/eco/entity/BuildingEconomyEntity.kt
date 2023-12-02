package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyConsumptionType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntityConfig
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntityUpdateState
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Building
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City

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
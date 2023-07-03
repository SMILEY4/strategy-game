package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.core.data.BasicEconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Building
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City

class BuildingEconomyEntity(
    val owner: EconomyNode,
    val city: City,
    val building: Building,
) : BasicEconomyEntity(
    owner = owner,
    priority = if (city.isProvinceCapital) 1.5f else 1f,
    resourcesInput = ResourceCollection.basic(building.type.templateData.requires),
    resourcesOutput = ResourceCollection.basic(building.type.templateData.produces),
    active = fulfillsTileRequirement(building),
) {

    companion object {

        private fun fulfillsTileRequirement(building: Building): Boolean {
            return building.type.templateData.requiredTileResource == null || building.tile != null
        }

    }

}
package de.ruegnerlukas.strategygame.backend.core.economyV3.service

import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack

class ConsumptionEntityUpdateService {

    fun update(entity: EconomyEntity, currentNode: EconomyNode) {
        println("entity ${entity}: ${entity.isReadyToConsume()}, ${entity.isReadyToProduce()}, ${entity.getRequires()}")
        if (allResourcesAvailable(currentNode, entity.getRequires())) {
            entity.getRequires().forEach {
                currentNode.getStorage().remove(it.type, it.amount)
                entity.provideResources(listOf(ResourceStack(it.type, it.amount)))
            }
        }
        // TODO: partial consumption
    }

    private fun allResourcesAvailable(node: EconomyNode, resources: Collection<ResourceStack>): Boolean {
        return resources.all { node.getStorage().getAvailable(it.type) >= it.amount }
    }

}
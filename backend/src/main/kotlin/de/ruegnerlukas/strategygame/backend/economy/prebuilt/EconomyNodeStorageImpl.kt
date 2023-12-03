package de.ruegnerlukas.strategygame.backend.economy.prebuilt

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNodeStorage

class EconomyNodeStorageImpl(private val initialResources: ResourceCollection) : EconomyNodeStorage {

    private val available = ResourceCollection.basic()

    override fun revertToInitial() {
        available.clear()
        available.add(initialResources)
    }

    override fun merge(other: EconomyNodeStorage) {
        ResourceType.values().forEach { type ->
            available.add(type, other.getAvailable(type))
        }
    }

    override fun getAvailable(type: ResourceType): Float {
        return available[type]
    }

    override fun getAvailable(): ResourceCollection {
        return available.copy()
    }

    override fun remove(type: ResourceType, amount: Float) {
        available.sub(type, amount)
    }

    override fun remove(resources: ResourceCollection) {
        available.sub(resources)
    }

    override fun add(type: ResourceType, amount: Float) {
        available.add(type, amount)
    }

    override fun add(resources: ResourceCollection) {
        available.add(resources)
    }

}
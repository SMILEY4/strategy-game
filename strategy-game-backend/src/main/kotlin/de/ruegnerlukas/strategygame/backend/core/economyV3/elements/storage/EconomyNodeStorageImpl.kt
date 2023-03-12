package de.ruegnerlukas.strategygame.backend.core.economyV3.elements.storage

import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

class EconomyNodeStorageImpl(private val initialResources: ResourceStats) : EconomyNodeStorage {

    private val available = ResourceStats()
    private val added = ResourceStats()
    private val removed = ResourceStats()

    override fun revertToInitial() {
        added.clear()
        removed.clear()
        available.clear()
        available.add(initialResources)
    }

    override fun merge(other: EconomyNodeStorage) {
        ResourceType.values().forEach { type ->
            available.add(type, other.getAvailable(type))
        }
    }

    override fun getAvailable(type: ResourceType): Float {
        return available[type] - removed[type]
    }

    override fun remove(type: ResourceType, amount: Float) {
        removed.add(type, amount)
    }

    override fun add(type: ResourceType, amount: Float) {
        added.add(type, amount)
    }

    override fun getAdded(): ResourceStats = added

    override fun getRemoved(): ResourceStats = removed
}
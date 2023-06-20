package de.ruegnerlukas.strategygame.backend.economy.core.data

import de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.ResourceType

class EconomyNodeStorageImpl(private val initialResources: ResourceCollection) : EconomyNodeStorage {

    private val available = ResourceCollection.basic()
    private val added = ResourceCollection.basic()
    private val removed = ResourceCollection.basic()
    private val removedFromShared = ResourceCollection.basic()

    override fun revertToInitial() {
        added.clear()
        removed.clear()
        removedFromShared.clear()
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

    override fun getAvailable(): ResourceCollection = available.copy()

    override fun remove(type: ResourceType, amount: Float) {
        removed.add(type, amount)
    }

    override fun remove(resources: ResourceCollection) {
        removed.add(resources)
    }

    override fun removedFromSharedStorage(type: ResourceType, amount: Float) {
        removedFromShared.add(type, amount)
    }

    override fun removedFromSharedStorage(resources: ResourceCollection) {
        removedFromShared.add(resources)
    }

    override fun add(type: ResourceType, amount: Float) {
        added.add(type, amount)
    }

    override fun add(resources: ResourceCollection) {
        added.add(resources)
    }

    override fun getAdded(): ResourceCollection = added.copy()

    override fun getRemoved(): ResourceCollection = removed.copy()

    override fun getRemovedFromShared(): ResourceCollection = removedFromShared.copy()

}
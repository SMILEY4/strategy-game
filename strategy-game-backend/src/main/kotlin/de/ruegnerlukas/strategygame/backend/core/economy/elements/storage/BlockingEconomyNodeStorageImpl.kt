package de.ruegnerlukas.strategygame.backend.core.economy.elements.storage

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

class BlockingEconomyNodeStorageImpl : EconomyNodeStorage {

    override fun revertToInitial() = Unit

    override fun merge(other: EconomyNodeStorage) = Unit

    override fun getAvailable(type: ResourceType): Float = 0f

    override fun getAvailable(): ResourceCollection = ResourceCollection.basic()

    override fun remove(type: ResourceType, amount: Float) = Unit

    override fun remove(resources: ResourceCollection) = Unit

    override fun removedFromSharedStorage(type: ResourceType, amount: Float) = Unit

    override fun removedFromSharedStorage(resources: ResourceCollection)  = Unit

    override fun add(type: ResourceType, amount: Float) = Unit

    override fun add(resources: ResourceCollection)  = Unit

    override fun getAdded(): ResourceCollection = ResourceCollection.basic()

    override fun getRemoved(): ResourceCollection = ResourceCollection.basic()

    override fun getRemovedFromShared(): ResourceCollection = ResourceCollection.basic()
}
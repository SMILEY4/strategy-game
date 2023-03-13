package de.ruegnerlukas.strategygame.backend.core.economyV3.elements.storage

import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyNodeStorage
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

class BlockingEconomyNodeStorageImpl : EconomyNodeStorage {

    override fun revertToInitial() = Unit

    override fun merge(other: EconomyNodeStorage) = Unit

    override fun getAvailable(type: ResourceType): Float = 0f

    override fun remove(type: ResourceType, amount: Float) = Unit

    override fun removedFromSharedStorage(type: ResourceType, amount: Float) = Unit

    override fun add(type: ResourceType, amount: Float) = Unit

    override fun getAdded(): ResourceStats = ResourceStats()

    override fun getRemoved(): ResourceStats = ResourceStats()

    override fun getRemovedFromShared(): ResourceStats = ResourceStats()
}
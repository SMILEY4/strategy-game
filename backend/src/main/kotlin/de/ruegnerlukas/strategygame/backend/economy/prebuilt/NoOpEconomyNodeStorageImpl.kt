package de.ruegnerlukas.strategygame.backend.economy.prebuilt

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNodeStorage

class NoOpEconomyNodeStorageImpl : EconomyNodeStorage {

    override fun revertToInitial() = Unit

    override fun merge(other: EconomyNodeStorage) = Unit

    override fun getAvailable(type: ResourceType): Float = 0f

    override fun getAvailable(): ResourceCollection = ResourceCollection.empty()

    override fun remove(type: ResourceType, amount: Float) = Unit

    override fun remove(resources: ResourceCollection) = Unit

    override fun add(type: ResourceType, amount: Float) = Unit

    override fun add(resources: ResourceCollection)  = Unit

}
package io.github.smiley4.strategygame.backend.ecosim.prebuilt

import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceType
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyNodeStorage


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
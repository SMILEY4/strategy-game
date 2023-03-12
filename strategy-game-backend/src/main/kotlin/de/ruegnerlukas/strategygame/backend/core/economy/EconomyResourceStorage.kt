package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

interface EconomyResourceStorage {
    fun update()
    fun getAvailable(type: ResourceType): Float
    fun add(type: ResourceType, amount: Float, origin: EconomyNode)
    fun remove(type: ResourceType, amount: Float, origin: EconomyNode)
    fun getRemovedResources(): ResourceStats
    fun getAddedResources(): ResourceStats
    fun getNode(): EconomyNode
}

class LocalEconomyResourceStorage(private val node: EconomyNode, resources: ResourceStats) : EconomyResourceStorage {

    private val initialResources: ResourceStats = resources
    private val removedResources: ResourceStats = ResourceStats()
    private val addedResources: ResourceStats = ResourceStats()

    override fun update() = Unit

    override fun getAvailable(type: ResourceType): Float = initialResources[type] - removedResources[type]

    override fun add(type: ResourceType, amount: Float, origin: EconomyNode) {
        addedResources.add(type, amount)
    }

    override fun remove(type: ResourceType, amount: Float, origin: EconomyNode) {
        removedResources.add(type, amount)
    }

    override fun getRemovedResources() = removedResources
    override fun getAddedResources() = addedResources

    override fun getNode() = node

}

class DistributedEconomyResourceStorage(
    private val node: EconomyNode,
    private val backingStorages: Collection<EconomyResourceStorage>
) : EconomyResourceStorage {

    private var initialResources: ResourceStats = ResourceStats()
    private var removedResources: ResourceStats = ResourceStats()
    private var addedResources: ResourceStats = ResourceStats()

    override fun update() {
        initialResources = ResourceStats().also { stats ->
            backingStorages.forEach { backing ->
                ResourceType.values().forEach { stats.add(it, backing.getAvailable(it)) }
            }
        }
        removedResources = ResourceStats()
        addedResources = ResourceStats()
    }

    override fun getAvailable(type: ResourceType): Float = initialResources[type] - removedResources[type]

    override fun add(type: ResourceType, amount: Float, origin: EconomyNode) {
        addedResources.add(type, amount)
    }

    override fun remove(type: ResourceType, amount: Float, origin: EconomyNode) {
        removedResources.add(type, amount)
    }

    override fun getRemovedResources() = removedResources
    override fun getAddedResources() = addedResources

    override fun getNode() = node


}
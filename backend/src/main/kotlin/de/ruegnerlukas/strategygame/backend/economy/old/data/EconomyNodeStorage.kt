package de.ruegnerlukas.strategygame.backend.economy.old.data

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType

/**
 * stores and manages resources or [EconomyNode]s
 */
interface EconomyNodeStorage {

    /**
     * prepare this storage and revert to its initial state, i.e. revert to the resources it had at the beginning of the turn
     */
    fun revertToInitial()


    /**
     * merge the (leftover) resources of the given storage into this storage
     */
    fun merge(other: EconomyNodeStorage)


    /**
     * @return the amount of available resources of the given type in this storage
     */
    fun getAvailable(type: ResourceType): Float


    /**
     * @return the amount of available resources in this storage
     */
    fun getAvailable(): ResourceCollection


    /**
     * Remove/Consume the given resources from this storage
     */
    fun remove(type: ResourceType, amount: Float)


    /**
     * Remove/Consume the given resources from this storage
     */
    fun remove(resources: ResourceCollection)


    /**
     * Mark the given resource amount as removed/taken from another storage,
     * i.e. the entity local to the node with this storage has taken the given resources from another storage.
     */
    fun removedFromSharedStorage(type: ResourceType, amount: Float)


    /**
     * Mark the given resource amount as removed/taken from another storage,
     * i.e. the entity local to the node with this storage has taken the given resources from another storage.
     */
    fun removedFromSharedStorage(resources: ResourceCollection)


    /**
     * Add the given resources to this storage
     */
    fun add(type: ResourceType, amount: Float)


    /**
     * Add the given resources to this storage
     */
    fun add(resources: ResourceCollection)


    /**
     * All resources added to this storage (via [EconomyNodeStorage.add])
     */
    fun getAdded(): ResourceCollection


    /**
     * All resources removed from this storage (via [EconomyNodeStorage.remove])
     */
    fun getRemoved(): ResourceCollection


    /**
     * All resources removed from another resource storage (via [EconomyNodeStorage.removedFromSharedStorage])
     */
    fun getRemovedFromShared(): ResourceCollection

}
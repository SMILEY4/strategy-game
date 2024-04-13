package de.ruegnerlukas.strategygame.backend.economy.data

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
     * Add the given resources to this storage
     */
    fun add(type: ResourceType, amount: Float)


    /**
     * Add the given resources to this storage
     */
    fun add(resources: ResourceCollection)

}
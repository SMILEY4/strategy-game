package de.ruegnerlukas.strategygame.backend.economy.old.data

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection


/**
 * Something that takes part in the economy by consuming and/or producing resources. Located in a specific node (e.g. city, province or country).
 */
interface EconomyEntity {

    /**
     * The node that "owns" this entity
     */
    fun getNode(): EconomyNode


    /**
     * @return the priority of this entity
     */
    fun getPriority(): Float


    /**
     * @return the resources this entity requires or wants to consume. Can change when this entity is provided resources.
     */
    fun getRequiredInput(): ResourceCollection


    /**
     * @return the resources this entity produces/generates
     */
    fun getOutput(): ResourceCollection


    /**
     * @return whether all resources have to be fully consumed from the storage of the "owning" node or
     * if some part can be taken from "higher" nodes.
     */
    fun allowPartialInput(): Boolean


    /**
     * Whether this entity is taking part in consumption or production
     */
    fun isActive(): Boolean


    /**
     * @return whether this entity is ready to consume resources
     */
    fun allowReadyForInput(): Boolean


    /**
     * @return whether this entity is ready to produce resources
     */
    fun isReadyForOutput(): Boolean


    /**
     * @return whether this entity has produced resources / was handled during production phase
     */
    fun completedOutput(): Boolean


    /**
     * provide this entity with the given required resources
     */
    fun addResources(resources: ResourceCollection)


    /**
     * flags this entity as "has produced all its resources"
     */
    fun flagOutputDone()

}
package de.ruegnerlukas.strategygame.backend.core.economy.data

import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack

/**
 * Something that takes part in the economy by consuming and/or producing resources. Can be located in a specific city,province or country.
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
     * @return the resources this entity requires or wants to consume. Changes when this entity is provided resources.
     */
    fun getRequires(): Collection<ResourceStack>


    /**
     * @return the resources this entity produces
     */
    fun getProduces(): Collection<ResourceStack>


    /**
     * @return whether all resources have to be fully consumed from the storage of the "owning" node or
     * if some part can be taken from "higher" nodes.
     */
    fun allowPartialConsumption(): Boolean


    /**
     * Whether this entity is inactive and is not taking part in consumption or production
     */
    fun isInactive(): Boolean


    /**
     * @return whether this entity is ready to consume resources
     */
    fun isReadyToConsume(): Boolean


    /**
     * @return whether this entity is ready to produce resources
     */
    fun isReadyToProduce(): Boolean


    /**
     * @return whether this entity has produced resources / was handled during production phase
     */
    fun hasProduced(): Boolean


    /**
     * provide this entity with the given required resources
     */
    fun provideResources(resources: Collection<ResourceStack>)


    /**
     * flags this entity as "has produced all its resources"
     */
    fun flagProduced()

}
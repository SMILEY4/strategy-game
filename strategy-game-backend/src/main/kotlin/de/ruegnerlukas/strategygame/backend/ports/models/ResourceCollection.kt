package de.ruegnerlukas.strategygame.backend.ports.models

interface ResourceCollection {

    companion object {

        const val DEFAULT_DELTA: Float = 0.00001f

        fun empty() = basic()

        /**
         * @return a new [BasicResourceCollection] with the given data
         */
        fun basic(resources: Map<ResourceType, Number>): BasicResourceCollection {
            return BasicResourceCollection().also { collection ->
                resources.forEach { (type, amount) ->
                    collection.set(type, amount.toFloat())
                }
            }
        }


        /**
         * @return a new [BasicResourceCollection] with the given data
         */
        fun basic(resources: Collection<ResourceStack>): BasicResourceCollection {
            return BasicResourceCollection().also { collection ->
                resources.forEach { stack ->
                    collection.set(stack.type, stack.amount)
                }
            }
        }


        /**
         * @return a new [BasicResourceCollection] with the given data
         */
        fun basic(vararg resources: ResourceStack): BasicResourceCollection {
            return BasicResourceCollection().also { collection ->
                resources.forEach { stack ->
                    collection.set(stack.type, stack.amount)
                }
            }
        }


        /**
         * @return a new [BasicResourceCollection] with the given data
         */
        fun basic(resources: ResourceCollection): BasicResourceCollection {
            return BasicResourceCollection().also { collection ->
                resources.forEach { type, amount ->
                    collection.set(type, amount)
                }
            }
        }

    }


    /**
     * @return the amount of the given resource type
     */
    operator fun get(type: ResourceType): Float


    /**
     * Add the given amount to the given resource type.
     * @param type the resource type to add to
     * @param amount the amount of resources to add
     * @return this [ResourceCollection] for chaining
     */
    fun add(type: ResourceType, amount: Float): ResourceCollection


    /**
     * Add the given resources to this collection.
     * @param resources the resources to add
     * @return this [ResourceCollection] for chaining
     */
    fun add(resources: ResourceCollection): ResourceCollection


    /**
     * Add the given resources to this collection.
     * @param resources the resources to add
     * @return this [ResourceCollection] for chaining
     */
    fun add(resources: ResourceStack): ResourceCollection


    /**
     * Add the given resources to this collection.
     * @param resources the resources to add
     * @return this [ResourceCollection] for chaining
     */
    fun add(resources: Collection<ResourceStack>): ResourceCollection


    /**
     * Subtract the given amount from the given resource type.
     * @param type the resource type to subtract from
     * @param amount the amount of resources to subtract
     * @return this [ResourceCollection] for chaining
     */
    fun sub(type: ResourceType, amount: Float): ResourceCollection


    /**
     * Subtract the given resources from this collection.
     * @param resources the resources to subtract
     * @return this [ResourceCollection] for chaining
     */
    fun sub(resources: ResourceCollection): ResourceCollection


    /**
     * Subtract the given resources from this collection.
     * @param resources the resources to subtract
     * @return this [ResourceCollection] for chaining
     */
    fun sub(resources: ResourceStack): ResourceCollection


    /**
     * Subtract the given resources from this collection.
     * @param resources the resources to subtract
     * @return this [ResourceCollection] for chaining
     */
    fun sub(resources: Collection<ResourceStack>): ResourceCollection


    /**
     * Scale the amount of the given resource type by the given factor.
     * @param type the resource type to scale
     * @param factor the factor to scale by
     * @return this [ResourceCollection] for chaining
     */
    fun scale(type: ResourceType, factor: Float): ResourceCollection


    /**
     * Scale the amount of the all resources type by the given factor.
     * @param factor the factor to scale by
     * @return this [ResourceCollection] for chaining
     */
    fun scale(factor: Float): ResourceCollection


    /**
     * Set the amount of the given resource type.
     * @param type the resource type to set the amount of
     * @param amount the amount to set to
     * @return this [ResourceCollection] for chaining
     */
    fun set(type: ResourceType, amount: Float): ResourceCollection


    /**
     * Clear the amount of the given resource type (i.e. set to '0').
     * @param type the resource type to clear
     */
    fun clear(type: ResourceType): ResourceCollection


    /**
     * Clear the all resource types of this collection (i.e. set everything to '0').
     */
    fun clear(): ResourceCollection


    /**
     * Trim/Cleanup this collection, removing no longer required data.
     */
    fun trim(): ResourceCollection


    /**
     * @param type the resource type to check
     * @param amount the expected amount
     * @return whether the given resource type has more or equal to given amount
     */
    fun hasAtLeast(type: ResourceType, amount: Float): Boolean


    /**
     * @param type the resource type to check
     * @param amount the expected amount
     * @param plusMinus by how much the values can be different to still be considered "equal" (use collections default value if not provided)
     * @return whether the given resource type has exactly the given amount
     */
    fun hasExactly(type: ResourceType, amount: Float, plusMinus: Float = getDelta()): Boolean


    /**
     * @return whether all individual resources in this collection have an amount of '0'.
     * A resource that has a negative amount IS NOT considered to be '0'.
     * If one resource has an amount of -x and another of +x, they do not cancel out and both are not considered to be '0'.
     */
    fun isZero(): Boolean


    /**
     * @return whether this collection contains any resource that is not '0', i.e. the opposite of [ResourceCollection.isZero]
     */
    fun isNotZero(): Boolean


    /**
     * @return whether this collection is empty, i.e. no resource type has a positive amount.
     * A resource that has a negative amount IS considered to be 'empty'.
     */
    fun isEmpty(): Boolean


    /**
     * @return whether this collection contains any resource that has a positive amount, i.e. the opposite of [ResourceCollection.isEmpty]
     */
    fun isNotEmpty(): Boolean


    /**
     * @param includeZero whether to include resources that have an amount equal to '0'
     * @param condition the condition to apply to all resources with their amounts
     * @return true, if all resources (with a non-zero amount) match the given condition
     */
    fun all(includeZero: Boolean = false, condition: (type: ResourceType, amount: Float) -> Boolean): Boolean


    /**
     * @param includeZero whether to include resources that have an amount equal to '0'
     * @param condition the condition to apply to all resources with their amounts
     * @return true, if any resource (with a non-zero amount) match the given condition
     */
    fun any(includeZero: Boolean = false, condition: (type: ResourceType, amount: Float) -> Boolean): Boolean


    /**
     * Iterates over every resource's type and its amount
     * @param includeZero whether to include resources that have an amount equal to '0'
     * @param consumer the function to call for each resource type with its amount
     */
    fun forEach(includeZero: Boolean = false, consumer: (type: ResourceType, amount: Float) -> Unit)


    /**
     * @param includeZero whether to include resources that have an amount equal to '0'
     * @return a new map of resource type to amount with the same data as this collection
     */
    fun toMap(includeZero: Boolean = false): Map<ResourceType, Float>


    /**
     * @param includeZero whether to include resources that have an amount equal to '0'
     * @return a new list with pairs of resource type and amount with the same data as this collection
     */
    fun toList(includeZero: Boolean = false): Collection<Pair<ResourceType, Float>>


    /**
     * @param includeZero whether to include resources that have an amount equal to '0'
     * @return a new list of [ResourceStack] with the same data as this collection
     */
    fun toStacks(includeZero: Boolean = false): List<ResourceStack>


    /**
     * @return a new collection with the same data as this collection
     */
    fun copy(): ResourceCollection


    /**
     *
     * @param delta the new delta-value (used when comparing floating-point values)
     * @return this collection for chaining
     */
    fun setDelta(delta: Float): ResourceCollection


    /**
     * @return the delta-value of this collection (used when comparing floating-point values)
     */
    fun getDelta(): Float

}
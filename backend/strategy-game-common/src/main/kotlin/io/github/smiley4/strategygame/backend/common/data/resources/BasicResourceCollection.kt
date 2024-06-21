package io.github.smiley4.strategygame.backend.common.data.resources

import kotlin.math.abs

class BasicResourceCollection : ResourceCollection {

    private val resources = mutableMapOf<ResourceType, Float>()
    private var delta = ResourceCollection.DEFAULT_DELTA


    override operator fun get(type: ResourceType): Float {
        return resources[type] ?: 0f
    }


    override fun add(type: ResourceType, amount: Float): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        resources[type] = resources[type]?.let { it + amount } ?: amount
        return this
    }


    override fun add(resources: ResourceCollection): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        resources.forEach { type, amount -> add(type, amount) }
        return this
    }


    override fun add(resources: ResourceStack): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        add(resources.type, resources.amount)
        return this
    }


    override fun add(resources: Collection<ResourceStack>): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        resources.forEach { add(it) }
        return this
    }


    override fun sub(type: ResourceType, amount: Float): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        add(type, -amount)
        return this
    }


    override fun sub(resources: ResourceCollection): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        resources.forEach { type, amount -> sub(type, amount) }
        return this
    }


    override fun sub(resources: ResourceStack): ResourceCollection {
        sub(resources.type, resources.amount)
        return this
    }


    override fun sub(resources: Collection<ResourceStack>): ResourceCollection {
        resources.forEach { sub(it) }
        return this
    }


    override fun scale(type: ResourceType, factor: Float): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        resources[type]?.also { resources[type] = it * factor }
        return this
    }


    override fun scale(factor: Float): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        resources.keys.forEach { scale(it, factor) }
        return this
    }


    override fun set(type: ResourceType, amount: Float): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        resources[type] = amount
        return this
    }


    override fun clear(type: ResourceType): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        resources.remove(type)
        return this
    }


    override fun clear(): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        resources.clear()
        return this
    }


    override fun trim(): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        resources.keys
            .filter { equalsZero(this[it]) }
            .forEach { clear(it) }
        return this
    }


    override fun hasAtLeast(type: ResourceType, amount: Float): Boolean =
        this[type] >= amount


    override fun hasExactly(type: ResourceType, amount: Float, plusMinus: Float): Boolean =
        abs(this[type] - amount) <= plusMinus


    override fun isZero(): Boolean =
        all { _, amount -> equalsZero(amount) }


    override fun isNotZero(): Boolean =
        !isZero()


    override fun isEmpty(): Boolean =
        all { _, amount -> amount < delta }


    override fun isNotEmpty(): Boolean =
        !isEmpty()


    override fun all(includeZero: Boolean, condition: (type: ResourceType, amount: Float) -> Boolean): Boolean =
        if (includeZero) {
            ResourceType.values()
                .all { condition(it, this[it]) }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .all { condition(it.key, it.value) }
        }


    override fun any(includeZero: Boolean, condition: (type: ResourceType, amount: Float) -> Boolean): Boolean =
        if (includeZero) {
            ResourceType.values()
                .any { condition(it, this[it]) }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .any { condition(it.key, it.value) }
        }


    override fun forEach(includeZero: Boolean, consumer: (type: ResourceType, amount: Float) -> Unit) =
        if (includeZero) {
            ResourceType.values()
                .forEach { consumer(it, this[it]) }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .forEach { (type, amount) -> consumer(type, amount) }
        }


    override fun toMap(includeZero: Boolean): Map<ResourceType, Float> =
        if (includeZero) {
            ResourceType.values()
                .associateWith { this[it] }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .toMap()
        }


    override fun toList(includeZero: Boolean): Collection<Pair<ResourceType, Float>> =
        if (includeZero) {
            ResourceType.values()
                .map { it to this[it] }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .map { (type, amount) -> type to amount }
        }


    override fun toStacks(includeZero: Boolean): List<ResourceStack> =
        if (includeZero) {
            ResourceType.values()
                .map { ResourceStack(it, this[it]) }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .map { (type, amount) -> ResourceStack(type, amount) }
        }


    override fun copy(): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection =
        ResourceCollection.basic(this)


    override fun setDelta(delta: Float): io.github.smiley4.strategygame.backend.common.data.resources.BasicResourceCollection {
        this.delta = delta
        return this
    }


    override fun getDelta(): Float {
        return delta
    }


    fun toDebugString(): String {
        return this::class.simpleName + ": " +
                System.lineSeparator() +
                resources.entries.joinToString(separator = System.lineSeparator()) { " - ${it.key} = ${it.value}" }
    }

    private fun equalsZero(value: Float): Boolean = abs(value) < delta

}
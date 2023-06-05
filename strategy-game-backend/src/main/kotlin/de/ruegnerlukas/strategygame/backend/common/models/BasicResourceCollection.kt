package de.ruegnerlukas.strategygame.backend.common.models

import kotlin.math.abs

class BasicResourceCollection : de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection {

    private val resources = mutableMapOf<de.ruegnerlukas.strategygame.backend.common.models.ResourceType, Float>()
    private var delta = de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection.Companion.DEFAULT_DELTA


    override operator fun get(type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType): Float {
        return resources[type] ?: 0f
    }


    override fun add(type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType, amount: Float): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        resources[type] = resources[type]?.let { it + amount } ?: amount
        return this
    }


    override fun add(resources: de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        resources.forEach { type, amount -> add(type, amount) }
        return this
    }


    override fun add(resources: de.ruegnerlukas.strategygame.backend.common.models.ResourceStack): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        add(resources.type, resources.amount)
        return this
    }


    override fun add(resources: Collection<de.ruegnerlukas.strategygame.backend.common.models.ResourceStack>): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        resources.forEach { add(it) }
        return this
    }


    override fun sub(type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType, amount: Float): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        add(type, -amount)
        return this
    }


    override fun sub(resources: de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        resources.forEach { type, amount -> sub(type, amount) }
        return this
    }


    override fun sub(resources: de.ruegnerlukas.strategygame.backend.common.models.ResourceStack): de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection {
        sub(resources.type, resources.amount)
        return this
    }


    override fun sub(resources: Collection<de.ruegnerlukas.strategygame.backend.common.models.ResourceStack>): de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection {
        resources.forEach { sub(it) }
        return this
    }


    override fun scale(type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType, factor: Float): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        resources[type]?.also { resources[type] = it * factor }
        return this
    }


    override fun scale(factor: Float): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        resources.keys.forEach { scale(it, factor) }
        return this
    }


    override fun set(type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType, amount: Float): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        resources[type] = amount
        return this
    }


    override fun clear(type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        resources.remove(type)
        return this
    }


    override fun clear(): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        resources.clear()
        return this
    }


    override fun trim(): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
        resources.keys
            .filter { equalsZero(this[it]) }
            .forEach { clear(it) }
        return this
    }


    override fun hasAtLeast(type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType, amount: Float): Boolean =
        this[type] >= amount


    override fun hasExactly(type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType, amount: Float, plusMinus: Float): Boolean =
        abs(this[type] - amount) <= plusMinus


    override fun isZero(): Boolean =
        all { _, amount -> equalsZero(amount) }


    override fun isNotZero(): Boolean =
        !isZero()


    override fun isEmpty(): Boolean =
        all { _, amount -> amount < delta }


    override fun isNotEmpty(): Boolean =
        !isEmpty()


    override fun all(includeZero: Boolean, condition: (type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType, amount: Float) -> Boolean): Boolean =
        if (includeZero) {
            de.ruegnerlukas.strategygame.backend.common.models.ResourceType.values()
                .all { condition(it, this[it]) }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .all { condition(it.key, it.value) }
        }


    override fun any(includeZero: Boolean, condition: (type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType, amount: Float) -> Boolean): Boolean =
        if (includeZero) {
            de.ruegnerlukas.strategygame.backend.common.models.ResourceType.values()
                .any { condition(it, this[it]) }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .any { condition(it.key, it.value) }
        }


    override fun forEach(includeZero: Boolean, consumer: (type: de.ruegnerlukas.strategygame.backend.common.models.ResourceType, amount: Float) -> Unit) =
        if (includeZero) {
            de.ruegnerlukas.strategygame.backend.common.models.ResourceType.values()
                .forEach { consumer(it, this[it]) }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .forEach { (type, amount) -> consumer(type, amount) }
        }


    override fun toMap(includeZero: Boolean): Map<de.ruegnerlukas.strategygame.backend.common.models.ResourceType, Float> =
        if (includeZero) {
            de.ruegnerlukas.strategygame.backend.common.models.ResourceType.values()
                .associateWith { this[it] }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .toMap()
        }


    override fun toList(includeZero: Boolean): Collection<Pair<de.ruegnerlukas.strategygame.backend.common.models.ResourceType, Float>> =
        if (includeZero) {
            de.ruegnerlukas.strategygame.backend.common.models.ResourceType.values()
                .map { it to this[it] }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .map { (type, amount) -> type to amount }
        }


    override fun toStacks(includeZero: Boolean): List<de.ruegnerlukas.strategygame.backend.common.models.ResourceStack> =
        if (includeZero) {
            de.ruegnerlukas.strategygame.backend.common.models.ResourceType.values()
                .map { de.ruegnerlukas.strategygame.backend.common.models.ResourceStack(it, this[it]) }
        } else {
            resources
                .filter { !equalsZero(it.value) }
                .map { (type, amount) -> de.ruegnerlukas.strategygame.backend.common.models.ResourceStack(type, amount) }
        }


    override fun copy(): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection =
        de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection.Companion.basic(this)


    override fun setDelta(delta: Float): de.ruegnerlukas.strategygame.backend.common.models.BasicResourceCollection {
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
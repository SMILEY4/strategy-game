package io.github.smiley4.strategygame.backend.common.utils


/**
 * Returns the sum of all values produced by [selector] function applied to each element in the collection.
 */
inline fun <T> Iterable<T>.sumOf(selector: (T) -> Float): Float {
    var sum = 0f
    for (element in this) {
        sum += selector(element)
    }
    return sum
}

inline fun <K, V> buildMutableMap(builderAction: MutableMap<K, V>.() -> Unit): MutableMap<K, V> {
    return mutableMapOf<K, V>().apply(builderAction)
}

inline fun <E> buildMutableList(builderAction: MutableList<E>.() -> Unit): MutableList<E> {
    return mutableListOf<E>().apply(builderAction)
}

inline fun <T, R> Iterable<T>.mapMutable(transform: (T) -> R): MutableList<R> {
    return this.map(transform).toMutableList()
}

fun <T> T.containedIn(collection: Collection<T>) = collection.contains(this)

fun <T> T.notContainedIn(collection: Collection<T>) = !collection.contains(this)

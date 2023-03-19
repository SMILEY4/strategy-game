package de.ruegnerlukas.strategygame.backend.shared

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.joinAll
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.coroutines.CoroutineContext

/**
 * Performs the given actions in parallel on the given [CoroutineContext]
 */
suspend fun parallel(context: CoroutineContext, actions: List<suspend () -> Unit>) {
    withContext(context) {
        actions.map { launch { it.invoke() } }.joinAll()
    }
}

/**
 * Performs the given actions in parallel on the given [CoroutineContext]
 */
suspend fun parallel(context: CoroutineContext, vararg actions: suspend () -> Unit) = parallel(context, actions.toList())

/**
 * Performs the given actions in parallel on the [Dispatchers.IO] [CoroutineContext]
 */
suspend fun parallelIO(vararg actions: suspend () -> Unit) = parallel(Dispatchers.IO, actions.toList())

/**
 * Performs the given actions in parallel on the [Dispatchers.Default] [CoroutineContext]
 */
suspend fun parallel(vararg actions: suspend () -> Unit) = parallel(Dispatchers.Default, actions.toList())

/**
 * Iterates over all elements in parallel on the given [CoroutineContext]
 */
suspend fun <T> Iterable<T>.forEachParallel(context: CoroutineContext, action: suspend (T) -> Unit) {
    withContext(context) {
        this@forEachParallel.map { launch { action(it) } }.joinAll()
    }
}

/**
 * Iterates over all elements in parallel on the [Dispatchers.Default] [CoroutineContext]
 */
suspend fun <T> Iterable<T>.forEachParallel(action: suspend (T) -> Unit) = this.forEachParallel(Dispatchers.Default, action)

/**
 * Iterates over all elements in parallel on the [Dispatchers.IO] [CoroutineContext]
 */
suspend fun <T> Iterable<T>.forEachParallelIO(action: suspend (T) -> Unit) = this.forEachParallel(Dispatchers.Default, action)

/**
 * Iterates over all elements in this sequence in parallel on the given [CoroutineContext]
 */
suspend fun <T> Sequence<T>.forEachParallel(context: CoroutineContext, action: suspend (T) -> Unit) {
    withContext(context) {
        this@forEachParallel.map { launch { action(it) } }.toList().joinAll()
    }
}

/**
 * Iterates over all elements in this sequence in parallel on the [Dispatchers.Default] [CoroutineContext]
 */
suspend fun <T> Sequence<T>.forEachParallel(action: suspend (T) -> Unit) = this.forEachParallel(Dispatchers.Default, action)

/**
 * Iterates over all elements in this sequence in parallel on the [Dispatchers.IO] [CoroutineContext]
 */
suspend fun <T> Sequence<T>.forEachParallelIO(action: suspend (T) -> Unit) = this.forEachParallel(Dispatchers.IO, action)

/**
 * Maps all elements in parallel on the given [CoroutineContext].
 */
suspend fun <T, R> Iterable<T>.mapParallel(context: CoroutineContext, transform: suspend (T) -> R): List<R> {
    return withContext(context) {
        this@mapParallel.map { async { transform(it) } }.awaitAll()
    }
}

/**
 * Maps all elements in parallel on the [Dispatchers.Default] [CoroutineContext]
 */
suspend fun <T, R> Iterable<T>.mapParallel(transform: suspend (T) -> R) = this.mapParallel(Dispatchers.Default, transform)

/**
 * Maps all elements in parallel on the [Dispatchers.IO] [CoroutineContext]
 */
suspend fun <T, R> Iterable<T>.mapParallelIO(transform: suspend (T) -> R) = this.mapParallel(Dispatchers.IO, transform)

/**
 * Maps all elements in parallel on the given [CoroutineContext].
 */
suspend fun <T, R> Sequence<T>.mapParallel(context: CoroutineContext, transform: suspend (T) -> R): Sequence<R> {
    return withContext(context) {
        this@mapParallel.map { async { transform(it) } }.toList().awaitAll().asSequence()
    }
}

/**
 * Maps all elements in parallel on the [Dispatchers.Default] [CoroutineContext]
 */
suspend fun <T, R> Sequence<T>.mapParallel(transform: suspend (T) -> R) = this.mapParallel(Dispatchers.Default, transform)

/**
 * Maps all elements in parallel on the [Dispatchers.IO] [CoroutineContext]
 */
suspend fun <T, R> Sequence<T>.mapParallelIO(transform: suspend (T) -> R) = this.mapParallel(Dispatchers.IO, transform)


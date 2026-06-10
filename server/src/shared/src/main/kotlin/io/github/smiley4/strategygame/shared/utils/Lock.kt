package io.github.smiley4.strategygame.shared.utils

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlin.math.abs

/**
 * Provides a mechanism to lock based on a value.
 * @param stripes The number of distinct mutexes to use.
 * Higher values reduce the chance of collisions between different keys.
 */
class KeyedMutex(private val stripes: Int = 1024) {

    private val locks = Array(stripes) { Mutex() }

    /**
     * Executes the [action] within a lock tied to the [key].
     * Different keys will likely run in parallel, while the same key
     * (by hashCode/equals) will be synchronized.
     */
    suspend fun <T> withLock(key: Any?, action: suspend () -> T): T {
        val index = if (key == null) 0 else abs(key.hashCode() % stripes)
        return locks[index].withLock {
            action()
        }
    }

}


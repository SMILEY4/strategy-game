package io.github.smiley4.strategygame.engine.shared

/**
 * Mutable counter shared across turns for tracking world-level numeric state.
 */
class WorldCounter(
    var counter: Int
) {

    fun increment() {
        counter++
    }

    fun decrement() {
        counter--
    }

}
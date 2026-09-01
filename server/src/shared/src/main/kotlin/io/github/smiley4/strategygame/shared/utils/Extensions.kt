package io.github.smiley4.strategygame.shared.utils


/**
 * Executes the given function [action] specified number of [times] or until the [action] returns true.
 * A zero-based index of current iteration is passed as a parameter to the [action] function.
 * If the [times] parameter is negative or equal to zero, the [action] function is not invoked.
 */
inline fun repeatUntil(times: Int, action: (Int) -> Boolean) {
    for (index in 0 until times) {
        if (action(index)) break
    }
}

package io.github.smiley4.strategygame.engine.shared

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
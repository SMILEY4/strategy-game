package io.github.smiley4.strategygame.engine.gameplay.data

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
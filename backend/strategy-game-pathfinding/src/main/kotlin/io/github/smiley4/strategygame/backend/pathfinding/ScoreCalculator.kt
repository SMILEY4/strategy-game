package io.github.smiley4.strategygame.backend.pathfinding

interface ScoreCalculator<T: Node> {
    fun f(g: Float, h: Float): Float
    fun g(prev: T, next: T): Float
    fun h(node: T, destination: T): Float
}
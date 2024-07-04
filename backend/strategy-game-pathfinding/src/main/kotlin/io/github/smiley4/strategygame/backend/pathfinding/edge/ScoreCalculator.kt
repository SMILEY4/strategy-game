package io.github.smiley4.strategygame.backend.pathfinding.module

import io.github.smiley4.strategygame.backend.pathfinding.edge.Node

internal interface ScoreCalculator<T: Node> {
    fun f(g: Float, h: Float): Float
    fun g(prev: T, next: T): Float
    fun h(node: T, destination: T): Float
}
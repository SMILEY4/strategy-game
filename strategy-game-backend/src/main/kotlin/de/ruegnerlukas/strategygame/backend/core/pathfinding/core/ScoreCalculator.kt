package de.ruegnerlukas.strategygame.backend.core.pathfinding.core

import de.ruegnerlukas.strategygame.backend.ports.models.Tile

interface ScoreCalculator<T: Node> {

    fun f(g: Float, h: Float): Float

    fun g(from: T, to: Tile): Float

    fun h(from: Tile, destination: Tile): Float


}
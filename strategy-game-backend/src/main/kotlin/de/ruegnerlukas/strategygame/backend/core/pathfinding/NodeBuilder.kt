package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile

interface NodeBuilder<T: Node> {

    fun start(tile: Tile): T

    fun next(prev: T, next: Tile, score: NodeScore): T

}
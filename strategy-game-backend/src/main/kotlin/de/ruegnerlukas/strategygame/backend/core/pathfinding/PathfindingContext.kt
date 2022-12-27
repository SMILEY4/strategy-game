package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer

data class PathfindingContext(
    val tiles: TileContainer,
    val tileStart: Tile,
    val tileEnd: Tile,
    val open: OpenList,
    val visited: VisitedList
)
package de.ruegnerlukas.strategygame.backend.core.pathfinding.core

import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer

interface Pathfinder<T : Node> {
    fun find(from: TilePosition, to: TilePosition, tiles: TileContainer): Path<T>
    fun find(tileStart: Tile, tileEnd: Tile, tiles: TileContainer): Path<T>
}
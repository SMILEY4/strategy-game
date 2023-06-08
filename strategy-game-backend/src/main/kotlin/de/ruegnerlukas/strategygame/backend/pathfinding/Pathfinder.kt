package de.ruegnerlukas.strategygame.backend.pathfinding

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.models.TileContainer

/**
 * Finds the path from a given starting tile/position to a destination tile/position
 */
interface Pathfinder<T : Node> {

    /**
     * @param start the starting position
     * @param destination the destination position
     * @param tiles all tiles
     * @return the path from start (incl.) to destination (incl.) - or an empty path if none exists
     */
    fun find(start: TilePosition, destination: TilePosition, tiles: TileContainer): Path<T>

    /**
     * @param tileStart the starting tile
     * @param tileDestination the destination tile
     * @param tiles all tiles
     * @return the path from start (incl.) to destination (incl.) - or an empty path if none exists
     */
    fun find(tileStart: Tile, tileDestination: Tile, tiles: TileContainer): Path<T>

}
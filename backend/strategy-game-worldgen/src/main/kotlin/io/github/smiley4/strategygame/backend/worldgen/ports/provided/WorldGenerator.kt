package io.github.smiley4.strategygame.backend.worldgen.ports.provided

import io.github.smiley4.strategygame.backend.worldgen.ports.WorldGenSettings
import io.github.smiley4.strategygame.backend.worldgen.ports.WorldGenTile

/**
 * Procedural generates world based on provided settings
 */
interface WorldGenerator {

    /**
     * Build the list of tiles for a new world based on the given [WorldGenSettings]
     */
    fun buildTiles(settings: WorldGenSettings): List<WorldGenTile>
}
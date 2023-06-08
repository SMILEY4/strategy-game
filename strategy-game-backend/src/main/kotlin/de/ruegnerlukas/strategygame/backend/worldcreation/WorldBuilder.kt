package de.ruegnerlukas.strategygame.backend.worldcreation

import de.ruegnerlukas.strategygame.backend.common.models.WorldSettings

interface WorldBuilder {
    fun buildTiles(settings: WorldSettings): List<WorldTile>
}
package de.ruegnerlukas.strategygame.backend.worldcreation

interface WorldBuilder {
    fun buildTiles(settings: WorldSettings): List<WorldTile>
}
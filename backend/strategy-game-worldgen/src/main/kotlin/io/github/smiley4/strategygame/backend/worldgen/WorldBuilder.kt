package io.github.smiley4.strategygame.backend.worldgen

interface WorldBuilder {
    fun buildTiles(settings: WorldSettings): List<WorldTile>
}
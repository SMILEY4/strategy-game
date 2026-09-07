package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.TileImprovementKey

class TileImprovementRegistry(
    entries: List<TileImprovementRegistryEntry> = defaultEntries(),
) {

    private val improvements = entries.associateBy { it.key }.also { byKey ->
        require(byKey.size == entries.size) { "Tile improvement keys must be unique" }
    }

    fun get(key: TileImprovementKey): TileImprovementRegistryEntry? = improvements[key]

    fun getAll(): List<TileImprovementRegistryEntry> = improvements.values.toList()

    companion object {
        private fun defaultEntries() = listOf(
            TileImprovementRegistryEntry(
                key = TileImprovementKey("farmstead"),
                condition = TileCondition.AllOf(
                    listOf(
                        TileCondition.ElevationIs(Tile.Elevation.FLAT),
                        TileCondition.BiomeIs(Tile.Biome.GRASSLAND),
                    )
                )
            ),
            TileImprovementRegistryEntry(
                key = TileImprovementKey("mine"),
                condition = TileCondition.AllOf(
                    listOf(
                        TileCondition.AnyOf(
                            listOf(
                                TileCondition.ElevationIs(Tile.Elevation.HILLS),
                                TileCondition.ElevationIs(Tile.Elevation.MOUNTAINS),
                            )
                        ),
                        TileCondition.HasResource(Tile.Resource.METAL),
                    )
                )
            ),
            TileImprovementRegistryEntry(
                key = TileImprovementKey("quarry"),
                condition = TileCondition.HasResource(Tile.Resource.STONE),
            ),
            TileImprovementRegistryEntry(
                key = TileImprovementKey("woodcutters-camp"),
                condition = TileCondition.FeatureIs(Tile.Feature.FOREST)
            ),
        )
    }

}

data class TileImprovementRegistryEntry(
    val key: TileImprovementKey,
    val condition: TileCondition,
) {
    fun isBuildableOn(tile: Tile): Boolean = condition.matches(tile)
}

sealed interface TileCondition {
    fun matches(tile: Tile): Boolean

    data class AllOf(val conditions: List<TileCondition>) : TileCondition {
        override fun matches(tile: Tile): Boolean = conditions.all { it.matches(tile) }
    }

    data class AnyOf(val conditions: List<TileCondition>) : TileCondition {
        override fun matches(tile: Tile): Boolean = conditions.any { it.matches(tile) }
    }

    data class Not(val condition: TileCondition) : TileCondition {
        override fun matches(tile: Tile): Boolean = !condition.matches(tile)
    }

    data class ElevationIs(val value: Tile.Elevation) : TileCondition {
        override fun matches(tile: Tile): Boolean = tile.world.elevation == value
    }

    data class BiomeIs(val value: Tile.Biome) : TileCondition {
        override fun matches(tile: Tile): Boolean = tile.world.biome == value
    }

    data class FeatureIs(val value: Tile.Feature) : TileCondition {
        override fun matches(tile: Tile): Boolean = tile.world.feature == value
    }

    data class HasResource(val value: Tile.Resource) : TileCondition {
        override fun matches(tile: Tile): Boolean = tile.world.resources.any { it.type == value }
    }
}

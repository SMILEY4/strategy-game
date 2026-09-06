package io.github.smiley4.strategygame.engine.simulation.turn.tools

import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile

class TileImprovementRegistry {

    private val improvements = listOf(
        TileImprovementRegistryEntry(
            key = "farmstead",
        ),
        TileImprovementRegistryEntry(
            key = "mine"
        ),
        TileImprovementRegistryEntry(
            key = "quarry"
        ),
        TileImprovementRegistryEntry(
            key = "woodcutters-camp"
        )
    )

    fun getAll(): List<TileImprovementRegistryEntry> {
        return improvements
    }

}


data class TileImprovementRegistryEntry(
    val key: String,
    val conditions: List<Condition<Any>>
) {


    interface Condition<T>

    data class NotCondition<T>(val condition: Condition<T>) : Condition<T>
    data class OrCondition<T>(val conditions: List<Condition<T>>) : Condition<T>
    data class AndCondition<T>(val conditions: List<Condition<T>>) : Condition<T>
    data class EqualsCondition<T>(val value: T): Condition<T>

    typealias ElevationCondition = Condition<Tile.Elevation>
    typealias BiomeCondition = Condition<Tile.Biome>
    typealias FeatureCondition = Condition<Tile.Feature>
    typealias ResourceCondition = Condition<Tile.Resource>

}
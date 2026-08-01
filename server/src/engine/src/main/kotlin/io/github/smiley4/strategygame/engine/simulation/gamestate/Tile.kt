package io.github.smiley4.strategygame.engine.simulation.gamestate

import io.github.smiley4.strategygame.shared.values.UserId
import kotlin.uuid.Uuid

data class Tile(
    val id: Id,
    val position: HexPosition,
    val world: WorldData,
    val discoveredBy: MutableSet<UserId>,
    val meta: Metadata,
) {

    @JvmInline
    value class Id(val id: Uuid = Uuid.random())

    data class Ref(
        val id: Id,
        val position: HexPosition,
    )

    fun ref() = Ref(id = this.id, position = this.position)

    data class WorldData(
        val biome: Biome,
        val elevation: Elevation,
        val feature: Feature?,
        val resources: List<ResourceDeposit>,
    )

    enum class Biome {
        OCEAN, COAST, GRASSLAND, PLAINS, DESERT, TUNDRA, SNOW
    }

    enum class Elevation {
        FLAT, HILLS, MOUNTAINS
    }

    enum class Feature {
        FOREST, JUNGLE, MARSH
    }

    data class ResourceDeposit(
        val type: Resource,
        val amount: Float,
        val maxAmount: Float,
        val changeRate: Float,
        val removeOnDeplete: Boolean,
    )

    enum class Resource {
        STONE, WOOD, METAL, FISH
    }

    data class Metadata(
        val seed: Int,
        val chunk: HexPosition,
    )
}
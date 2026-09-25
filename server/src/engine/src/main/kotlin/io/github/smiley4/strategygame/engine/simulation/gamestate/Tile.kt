package io.github.smiley4.strategygame.engine.simulation.gamestate

data class Tile(
    /** The id of this tile */
    val id: Id,
    /** The position of this tile */
    val position: HexPosition,
    /** General world data of this tile */
    val world: WorldData,
    /** General political data of this tile */
    val political: PoliticalData,
    /** Additional metadata */
    val meta: Metadata,
) {

    @JvmInline
    value class Id(val id: Int)

    data class Ref(
        val id: Id,
        val position: HexPosition,
    )

    fun ref() = Ref(id = this.id, position = this.position)

    data class WorldData(
        /** The elevation level */
        val elevation: Elevation,
        /** The rough biome  */
        val biome: Biome,
        /** An additional (surface) feature on this tile */
        val feature: Feature?,
        /** List of resources present on the tile */
        val resources: List<ResourceDeposit>,
    )


    data class PoliticalData(
        /** List of realms that had vision on this tile in the past or know otherwise of this tile */
        val discoveredBy: MutableSet<Realm.Id>,
        /** The amount of control over this tile from any source */
        val control: MutableMap<Entity.Id, ControlEntry>,
        /** The realm actually owning this tile */
        var ownerRealm: Realm.Id?,
        /** The current process of converting this tiles owner */
        var conversion: TileConversion?,
    )

    data class TileConversion(
        /** The realm that will become owner (or null if tile converts to neutral) */
        val targetRealm: Realm.Id?,
        /** The current progress (in range 0 to 1) */
        var progress: Float,
    )

    data class ControlEntry(
        /** The entity acting as the source of the control */
        val entity: Entity.Id,
        /** The realm the control belongs to */
        val realm: Realm.Id,
        /** A settlement associated with the source of the control */
        val settlement: Entity.Id?,
        /** The amount of control */
        val amount: Float,
    )

    enum class Elevation {
        FLAT, HILLS, MOUNTAINS
    }

    enum class Biome {
        OCEAN, GRASSLAND
    }

    enum class Feature {
        FOREST
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

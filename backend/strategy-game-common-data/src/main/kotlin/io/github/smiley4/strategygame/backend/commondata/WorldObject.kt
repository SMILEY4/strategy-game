package io.github.smiley4.strategygame.backend.commondata

import kotlin.reflect.typeOf

data class WorldObject(
    val id: Id,
    val realm: Realm.Id,
    val type: Type,
    var tile: Tile.Ref,
    val components: MutableList<WorldObjectComponent>
) {
    @JvmInline
    value class Id(val value: String) {
        companion object
    }

    enum class Group {
        UNIT,
        TILE_IMPROVEMENT,
        SETTLEMENT
    }

    data class Type(
        val group: Group,
        val name: String,
    )

    inline fun <reified T : WorldObjectComponent> hasComponent(): Boolean {
        return components.any { component -> component is T }
    }

    inline fun <reified T : WorldObjectComponent> getComponentOrNull(): T? {
        return components.filterIsInstance<T>().firstOrNull()
    }

    inline fun <reified T : WorldObjectComponent> getComponent(): T {
        return getComponentOrNull<T>() ?: throw Exception("World object ${this.id} does not have component of type ${typeOf<T>()}.")
    }

}

sealed interface WorldObjectComponent {

    data class Movement(
        val maxMovement: Int
    ) : WorldObjectComponent

    data class Vision(
        val radius: Int
    ) : WorldObjectComponent

    class Builder(
        val maxUses: Int,
        var remainingUses: Int,
    ) : WorldObjectComponent

    class SettlementSpawner : WorldObjectComponent

    class RouteNote(
        val maxRouteConnectionDistance: Int
    ) : WorldObjectComponent

    class Economy(
        val storage: ResourceStorage,
        val entries: MutableList<Entry>,
        val log: MutableList<Log>
    ) : WorldObjectComponent {

        data class Entry(
            val name: String,
            val priority: Int,
            var active: Boolean = true,
            val harvests: Map<ResourceType, Double>,
            val consumes: Map<ResourceType, Double>,
            val produces: Map<ResourceType, Double>,
        )

        data class Log(
            val logType: String,
            val entryName: String,
            val resourceType: ResourceType,
            val amount: Double,
        )

    }

    class Production(
        val queue: MutableList<ProductionQueueEntry>,
        val collectedResources: MutableMap<ResourceType, Double>
    ) : WorldObjectComponent {

        sealed class ProductionQueueEntry(
            val requiredResources: Map<ResourceType, Double>,
            val resourceBatches: List<Map<ResourceType, Double>>
        ) {
            class Worker : ProductionQueueEntry(
                requiredResources = mapOf(
                    ResourceType.FOOD to 2.0,
                    ResourceType.TIMBER to 6.0
                ),
                resourceBatches = listOf(
                    mapOf(
                        ResourceType.FOOD to 1.0,
                        ResourceType.TIMBER to 1.0
                    ),
                    mapOf(
                        ResourceType.FOOD to 1.0,
                        ResourceType.TIMBER to 2.0
                    ),
                    mapOf(
                        ResourceType.FOOD to 1.0,
                        ResourceType.TIMBER to 2.0
                    ),
                )
            )

            class Scout : ProductionQueueEntry(
                requiredResources = mapOf(
                    ResourceType.FOOD to 6.0
                ),
                resourceBatches = listOf(
                    mapOf(
                        ResourceType.FOOD to 1.0
                    ),
                    mapOf(
                        ResourceType.FOOD to 1.0
                    ),
                    mapOf(
                        ResourceType.FOOD to 1.0
                    )
                )
            )
        }

    }

}
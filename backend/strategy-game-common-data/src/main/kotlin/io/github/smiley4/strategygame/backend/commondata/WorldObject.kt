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

}
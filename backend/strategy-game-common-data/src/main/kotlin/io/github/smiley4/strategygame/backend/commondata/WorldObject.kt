package io.github.smiley4.strategygame.backend.commondata

import kotlin.reflect.typeOf

data class WorldObject(
    val id: Id,
    val realm: Realm.Id,
    val type: WorldObjectType,
    var tile: Tile.Ref,
    val components: List<WorldObjectComponent>
) {
    @JvmInline
    value class Id(val value: String) {
        companion object
    }


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

data class WorldObjectType(
    val group: String,
    val name: String,
) {

    companion object {
        val WORKER = WorldObjectType("unit", "worker")
        val SCOUT = WorldObjectType("unit", "scout")
    }

}

sealed interface WorldObjectComponent {

    data class Movement(
        val maxMovement: Int
    ) : WorldObjectComponent

    data class Vision(
        val radius: Int
    ) : WorldObjectComponent

}
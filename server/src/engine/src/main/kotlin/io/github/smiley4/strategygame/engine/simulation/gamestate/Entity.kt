package io.github.smiley4.strategygame.engine.simulation.gamestate

import io.github.smiley4.strategygame.shared.values.UserId
import kotlin.reflect.jvm.javaType
import kotlin.reflect.typeOf
import kotlin.uuid.Uuid

data class Entity(
    val id: Id,
    val components: List<EntityComponent>,
    val owner: UserId?
) {

    @JvmInline
    value class Id(val id: Uuid = Uuid.random())

    inline fun <reified T : EntityComponent> getComponentOrNull(): T? {
        return components.filterIsInstance<T>().firstOrNull()
    }

    inline fun <reified T : EntityComponent> getComponent(): T {
        return getComponentOrNull()
            ?: throw IllegalStateException("EntityComponent not found: ${typeOf<T>().javaType.typeName}")
    }

}


sealed interface EntityComponent {

    data class  Position(val tile: Tile.Ref) : EntityComponent

    data class PlayerSpawn(val radius: Int) : EntityComponent

    data class Settlement(val isRealmCapital: Boolean) : EntityComponent

}


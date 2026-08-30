package io.github.smiley4.strategygame.engine.simulation.gamestate

import kotlin.random.Random
import kotlin.reflect.jvm.javaType
import kotlin.reflect.typeOf

data class Entity(
    val id: Id,
    val components: List<EntityComponent>,
    val owner: Realm.Id?
) {

    @JvmInline
    value class Id(val id: Int = Random.nextInt(from = 1, until = Int.MAX_VALUE))

    inline fun <reified T : EntityComponent> hasComponent(): Boolean {
        return components.any { it is T }
    }

    inline fun <reified T : EntityComponent> getComponentOrNull(): T? {
        return components.filterIsInstance<T>().firstOrNull()
    }

    inline fun <reified T : EntityComponent> getComponent(): T {
        return getComponentOrNull()
            ?: throw IllegalStateException("EntityComponent not found: ${typeOf<T>().javaType.typeName}")
    }

}


sealed interface EntityComponent {

    data class Position(val tile: Tile.Ref) : EntityComponent

    data class PlayerSpawn(val radius: Int, var foundedRealm: Boolean) : EntityComponent

    data class Settlement(val name: String, val isRealmCapital: Boolean) : EntityComponent

    data class Vision(val radius: Int) : EntityComponent

    data class Control(val radius: Int, val amount: Float) : EntityComponent

}


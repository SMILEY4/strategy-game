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

    inline fun <reified T : EntityComponent> getComponent(): T {
        return getComponentOrNull()
            ?: throw IllegalStateException("EntityComponent not found: ${typeOf<T>().javaType.typeName}")
    }

    inline fun <reified T : EntityComponent> getComponentOrNull(): T? {
        return components.filterIsInstance<T>().firstOrNull()
    }

    inline fun <reified T1 : EntityComponent, reified T2 : EntityComponent> getComponentsOrNull(): Pair<T1, T2>? {
        val component1 = getComponentOrNull<T1>()
        val component2 = getComponentOrNull<T2>()
        if (component1 == null || component2 == null) {
            return null
        } else {
            return Pair(component1, component2)
        }
    }

    inline fun <
            reified T1 : EntityComponent,
            reified T2 : EntityComponent,
            reified T3 : EntityComponent
            > getComponentsOrNull(): Triple<T1, T2, T3>? {
        val component1 = getComponentOrNull<T1>()
        val component2 = getComponentOrNull<T2>()
        val component3 = getComponentOrNull<T3>()
        if (component1 == null || component2 == null || component3 == null) {
            return null
        } else {
            return Triple(component1, component2, component3)
        }
    }

}


sealed interface EntityComponent {

    data class Position(val tile: Tile.Ref) : EntityComponent

    data class Control(val amount: Float) : EntityComponent

    data class Settlement(val name: String, val isRealmCapital: Boolean) : EntityComponent

    data class TileImprovement(
        val key: TileImprovementKey,
        val administeringSettlement: Entity.Id,
    ) : EntityComponent
}

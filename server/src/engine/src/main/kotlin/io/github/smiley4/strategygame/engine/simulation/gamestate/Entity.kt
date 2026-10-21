package io.github.smiley4.strategygame.engine.simulation.gamestate

import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.DefinitionRegistry
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.StructureDefinition
import kotlin.random.Random
import kotlin.reflect.jvm.javaType
import kotlin.reflect.typeOf

data class Entity(
    val id: Id,
    val primaryClassification: PrimaryClassification,
    val components: List<EntityComponent>,
    val owner: Realm.Id?
) {

    @JvmInline
    value class Id(val id: Int = Random.nextInt(from = 1, until = Int.MAX_VALUE))

    enum class PrimaryClassification {
        SETTLEMENT,
        TILE_IMPROVEMENT
    }

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

    data class Name(val name: String) : EntityComponent

    data class RealmHierarchy(
        val isCapital: Boolean,
        val administeredBy: Entity.Id?
    ) : EntityComponent

    data class Population(
        val count: Map<DefinitionRegistry.PopulationClassKeys, Int>
    ) : EntityComponent

    data class Structures(
        val entries: List<StructureDefinition>
    )
}

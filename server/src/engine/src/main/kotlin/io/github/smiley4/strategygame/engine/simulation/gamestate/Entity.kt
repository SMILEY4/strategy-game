package io.github.smiley4.strategygame.engine.simulation.gamestate

import io.github.smiley4.strategygame.shared.values.UserId
import kotlin.uuid.Uuid

data class Entity(
    val id: Id,
    val components: List<EntityComponent>,
) {

    @JvmInline
    value class Id(val id: Uuid = Uuid.random())

    inline fun <reified T : EntityComponent> getComponent(): T {
        return components.filterIsInstance<T>().first()
    }

    inline fun <reified T : EntityComponent> getComponentOrNull(): T? {
        return components.filterIsInstance<T>().firstOrNull()
    }

}


interface EntityComponent {

    data class Position(val tile: Tile.Ref) : EntityComponent

    data class PlayerSpawn(val player: UserId, val radius: Int) : EntityComponent

}


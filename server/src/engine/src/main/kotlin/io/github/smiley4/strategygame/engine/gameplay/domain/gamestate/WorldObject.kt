package io.github.smiley4.strategygame.engine.gameplay.domain.gamestate

import kotlin.uuid.Uuid

data class WorldObject(
    val id: Id,
    val tile: Tile.Ref,
    val components: List<Component>
) {

    @JvmInline
    value class Id(val id: Uuid = Uuid.random())

    interface Component {

        class Movement(
            val maxMovement: Int,
        ) : Component

        class Vision(
            val radius: Int
        ) : Component
    }

}
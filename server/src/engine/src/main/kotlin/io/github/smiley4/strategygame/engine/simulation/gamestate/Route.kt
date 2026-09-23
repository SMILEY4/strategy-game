package io.github.smiley4.strategygame.engine.simulation.gamestate

import kotlin.random.Random

data class Route(
    val id: Id,
    val from: Entity.Id,
    val to: Entity.Id,
    val tiles: List<Tile.Ref>,
    val cost: Float
) {

    @JvmInline
    value class Id(val id: Int = Random.nextInt(from = 1, until = Int.MAX_VALUE))

}
package io.github.smiley4.strategygame.backend.sessions.infrastructure.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.utils.DbId

internal class RouteEntity(
    val gameId: String,
    val worldObjectA: String,
    val worldObjectB: String,
    val path: List<TileRefEntity>,
    val cost: Float,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Route, gameId: String) = RouteEntity(
            key = DbId.asDbId(serviceModel.id.value),
            gameId = gameId,
            worldObjectA = serviceModel.worldObjectA.value,
            worldObjectB = serviceModel.worldObjectB.value,
            path = serviceModel.path.map { TileRefEntity.of(it) },
            cost = serviceModel.cost,
        )
    }

    fun asServiceModel() = Route(
        id = Route.Id(this.getKeyOrThrow()),
        worldObjectA = WorldObject.Id(this.worldObjectA),
        worldObjectB = WorldObject.Id(this.worldObjectB),
        path = this.path.map { it.asServiceModel() },
        cost = this.cost,
    )

}
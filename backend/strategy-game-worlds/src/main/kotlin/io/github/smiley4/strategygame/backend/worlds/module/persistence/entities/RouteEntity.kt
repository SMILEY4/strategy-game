package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Route


class RouteEntity(
    val gameId: String,
    val cityIdA: String,
    val cityIdB: String,
    val path: List<TileRefEntity>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Route, gameId: String) = RouteEntity(
            key = DbId.asDbId(serviceModel.routeId),
            gameId = gameId,
            cityIdA = serviceModel.cityIdA,
            cityIdB = serviceModel.cityIdB,
            path = serviceModel.path.map { TileRefEntity.of(it) }
        )
    }

    fun asServiceModel() = Route(
        routeId = this.getKeyOrThrow(),
        cityIdA = this.cityIdA,
        cityIdB = this.cityIdB,
        path = this.path.map { it.asServiceModel() },
    )

}

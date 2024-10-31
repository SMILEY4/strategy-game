package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.Settlement


internal class RouteEntity(
    val gameId: String,
    val settlementIdA: String,
    val settlementIdB: String,
    val path: List<TileRefEntity>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Route, gameId: String) = RouteEntity(
            key = DbId.asDbId(serviceModel.id.value),
            gameId = gameId,
            settlementIdA = serviceModel.settlementA.value,
            settlementIdB = serviceModel.settlementB.value,
            path = serviceModel.path.map { TileRefEntity.of(it) }
        )
    }

    fun asServiceModel() = Route(
        id = Route.Id(this.getKeyOrThrow()),
        settlementA = Settlement.Id(this.settlementIdA),
        settlementB = Settlement.Id(this.settlementIdB),
        path = this.path.map { it.asServiceModel() },
    )

}

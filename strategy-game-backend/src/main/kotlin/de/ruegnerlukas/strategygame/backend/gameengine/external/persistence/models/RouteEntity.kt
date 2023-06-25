package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Route

class RouteEntity(
    val gameId: String,
    val cityIdA: String,
    val cityIdB: String,
    val path: List<TileRef>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Route, gameId: String) = RouteEntity(
            key = DbId.asDbId(serviceModel.routeId),
            gameId = gameId,
            cityIdA = serviceModel.cityIdA,
            cityIdB = serviceModel.cityIdB,
            path = serviceModel.path
        )
    }

    fun asServiceModel() = Route(
        routeId = this.getKeyOrThrow(),
        cityIdA = this.cityIdA,
        cityIdB = this.cityIdB,
        path = this.path,
    )

}

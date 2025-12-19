package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.Builder
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.Movement
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.RouteNode
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.SettlementSpawner
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.Vision

internal class WorldObjectEntity(
    val realmId: String,
    val gameId: String,
    val type: WorldObjectTypeEntity,
    val tile: TileRefEntity,
    val components: List<WorldObjectComponentEntity>,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: WorldObject, gameId: String): WorldObjectEntity {
            return WorldObjectEntity(
                key = serviceModel.id.value,
                realmId = serviceModel.realm.value,
                gameId = gameId,
                type = WorldObjectTypeEntity(
                    group = serviceModel.type.group.name,
                    name = serviceModel.type.name
                ),
                tile = TileRefEntity.of(serviceModel.tile),
                components = serviceModel.components.map {
                    when (it) {
                        is WorldObjectComponent.Movement -> Movement(
                            maxMovement = it.maxMovement,
                        )
                        is WorldObjectComponent.Vision -> Vision(
                            radius = it.radius
                        )
                        is WorldObjectComponent.Builder -> Builder(
                            maxUses = it.maxUses,
                            remainingUses = it.remainingUses
                        )
                        is WorldObjectComponent.SettlementSpawner -> SettlementSpawner()
                        is WorldObjectComponent.RouteNote -> RouteNode(
                            maxRouteConnectionDistance = it.maxRouteConnectionDistance
                        )
                    }
                }
            )
        }
    }

    fun asServiceModel(): WorldObject {
        return WorldObject(
            id = WorldObject.Id(this.getKeyOrThrow()),
            realm = Realm.Id(this.realmId),
            type = WorldObject.Type(
                group = WorldObject.Group.valueOf(this.type.group),
                name = this.type.name
            ),
            tile = this.tile.asServiceModel(),
            components = this.components.map {
                when (it) {
                    is Movement -> WorldObjectComponent.Movement(
                        maxMovement = it.maxMovement,
                    )
                    is Vision -> WorldObjectComponent.Vision(
                        radius = it.radius
                    )
                    is Builder -> WorldObjectComponent.Builder(
                        maxUses = it.maxUses,
                        remainingUses = it.remainingUses
                    )
                    is SettlementSpawner -> WorldObjectComponent.SettlementSpawner()
                    is RouteNode -> WorldObjectComponent.RouteNote(
                        maxRouteConnectionDistance = it.maxRouteConnectionDistance
                    )
                }
            }.toMutableList()
        )
    }

}

data class WorldObjectTypeEntity(
    val group: String,
    val name: String,
)


@JsonTypeInfo(
    use = JsonTypeInfo.Id.SIMPLE_NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed interface WorldObjectComponentEntity {

    data class Movement(
        val maxMovement: Int
    ) : WorldObjectComponentEntity

    data class Vision(
        val radius: Int
    ) : WorldObjectComponentEntity

    class Builder(
        val maxUses: Int,
        var remainingUses: Int,
    ) : WorldObjectComponentEntity

    class SettlementSpawner : WorldObjectComponentEntity

    class RouteNode(
        val maxRouteConnectionDistance: Int
    ) : WorldObjectComponentEntity

}
package io.github.smiley4.strategygame.backend.sessions.infrastructure.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.ResourceStorage
import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent.RouteNote
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.Builder
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.Economy
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.Economy.Entry
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.Economy.Log
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.Movement
import io.github.smiley4.strategygame.backend.sessions.application.persistence.entities.WorldObjectComponentEntity.Production
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
                        is RouteNote -> RouteNode(
                            maxRouteConnectionDistance = it.maxRouteConnectionDistance
                        )
                        is WorldObjectComponent.Economy -> Economy(
                            storage = it.storage.toMap(),
                            entries = it.entries.map { e ->
                                Entry(
                                    name = e.name,
                                    priority = e.priority,
                                    active = e.active,
                                    harvests = e.harvests,
                                    consumes = e.consumes,
                                    produces = e.produces,
                                )
                            },
                            log = it.log.map { e ->
                                Log(
                                    logType = e.logType,
                                    entryName = e.entryName,
                                    resourceType = e.resourceType,
                                    amount = e.amount,
                                )
                            },
                        )
                        is WorldObjectComponent.Production -> Production(
                            queue = it.queue.map { entry ->
                                when (entry) {
                                    is WorldObjectComponent.Production.ProductionQueueEntry.Scout -> "scout"
                                    is WorldObjectComponent.Production.ProductionQueueEntry.Worker -> "worker"
                                }
                            },
                            collectedResources = it.collectedResources,
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
                    is RouteNode -> RouteNote(
                        maxRouteConnectionDistance = it.maxRouteConnectionDistance
                    )
                    is Economy -> WorldObjectComponent.Economy(
                        storage = ResourceStorage(it.storage),
                        entries = it.entries.map { e ->
                            WorldObjectComponent.Economy.Entry(
                                name = e.name,
                                priority = e.priority,
                                active = e.active,
                                harvests = e.harvests,
                                consumes = e.consumes,
                                produces = e.produces,
                            )
                        }.toMutableList(),
                        log = it.log.map { e ->
                            WorldObjectComponent.Economy.Log(
                                logType = e.logType,
                                entryName = e.entryName,
                                resourceType = e.resourceType,
                                amount = e.amount,
                            )
                        }.toMutableList(),
                    )
                    is Production -> WorldObjectComponent.Production(
                        queue = it.queue.map { entry ->
                            when (entry) {
                                "scout" -> WorldObjectComponent.Production.ProductionQueueEntry.Scout()
                                "worker" -> WorldObjectComponent.Production.ProductionQueueEntry.Worker()
                                else -> throw Exception("Unexpected queue entry identifier")
                            }
                        }.toMutableList(),
                        collectedResources = it.collectedResources.toMutableMap()
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

    class Economy(
        val storage: Map<ResourceType, Double>,
        val entries: List<Entry>,
        val log: List<Log>
    ) : WorldObjectComponentEntity {

        data class Entry(
            val name: String,
            val priority: Int,
            var active: Boolean = true,
            val harvests: Map<ResourceType, Double>,
            val consumes: Map<ResourceType, Double>,
            val produces: Map<ResourceType, Double>,
        )

        data class Log(
            val logType: String,
            val entryName: String,
            val resourceType: ResourceType,
            val amount: Double,
        )

    }

    class Production(
        val queue: List<String>,
        val collectedResources: Map<ResourceType, Double>
    ) : WorldObjectComponentEntity

}
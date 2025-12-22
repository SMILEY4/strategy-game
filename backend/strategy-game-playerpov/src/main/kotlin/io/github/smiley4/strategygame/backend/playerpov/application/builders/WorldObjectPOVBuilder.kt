package io.github.smiley4.strategygame.backend.playerpov.application.builders

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.TileImprovementType
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import io.github.smiley4.strategygame.backend.playerpov.application.POVCache
import io.github.smiley4.strategygame.backend.playerpov.application.TileVisibilityDTO
import io.github.smiley4.strategygame.backend.playerpov.application.isLessThan
import kotlin.math.min


internal class WorldObjectPOVBuilder(private val povCache: POVCache) {

    fun build(worldObject: WorldObject): JsonType? {
        if (povCache.worldObjectVisibility(worldObject.id).isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return null
        }
        return obj {
            "id" to worldObject.id.value
            "type" to obj {
                "group" to when (worldObject.type.group) {
                    WorldObject.Group.UNIT -> "unit"
                    WorldObject.Group.TILE_IMPROVEMENT -> "tile-improvement"
                    WorldObject.Group.SETTLEMENT -> "settlement"
                }
                "name" to worldObject.type.name
            }
            "realm" to povCache.realmIdentifier(worldObject.realm)
            "tile" to povCache.tileIdentifier(worldObject.tile.id)
            "components" to worldObject.components.map { component ->
                when (component) {
                    is WorldObjectComponent.Movement -> obj {
                        "type" to "movement"
                        "maxMovement" to component.maxMovement
                    }
                    is WorldObjectComponent.Vision -> obj {
                        "type" to "vision"
                        "radius" to component.radius
                    }
                    is WorldObjectComponent.Builder -> obj {
                        "type" to "builder"
                        "maxUses" to component.maxUses
                        "remainingUses" to component.remainingUses
                        "options" to TileImprovementType.entries.map {
                            obj {
                                "type" to it.name
                                "available" to true
                            }
                        }
                    }
                    is WorldObjectComponent.SettlementSpawner -> obj {
                        "type" to "settlementSpawner"
                    }
                    is WorldObjectComponent.RouteNote -> obj {
                        "type" to "routeNode"
                    }
                    is WorldObjectComponent.Economy -> obj {
                        "type" to "economy"
                        "storage" to obj {
                            ResourceType.entries.forEach { type ->
                                type.name to component.storage.getAmount(type)
                            }
                        }
                        "entries" to component.entries.map { entry ->
                            obj {
                                "name" to entry.name
                                "active" to entry.active
                            }
                        }
                        "log" to component.log.map {
                            obj {
                                "logType" to it.logType
                                "entryName" to it.entryName
                                "resourceType" to it.resourceType.name
                                "amount" to it.amount
                            }
                        }
                    }
                    is WorldObjectComponent.Production -> obj {
                        "type" to "production"
                        "queue" to component.queue.map { queueEntry ->
                            obj {
                                "type" to when (queueEntry) {
                                    is WorldObjectComponent.Production.ProductionQueueEntry.Scout -> "scout"
                                    is WorldObjectComponent.Production.ProductionQueueEntry.Worker -> "worker"
                                }
                                "progress" to calculateProductionQueueEntryProgress(component, queueEntry)
                            }
                        }
                    }
                }
            }
        }
    }

    private fun calculateProductionQueueEntryProgress(
        production: WorldObjectComponent.Production,
        queueEntry: WorldObjectComponent.Production.ProductionQueueEntry
    ): Double {
        if (queueEntry == production.queue.firstOrNull()) {
            val totalRequiredAmount = queueEntry.requiredResources
                .map { it.value }
                .sum()
            val totalCollectedAmount = production.collectedResources
                .map { min(it.value, queueEntry.requiredResources.getOrDefault(it.key, 0.0)) }
                .sum()
            return totalCollectedAmount / totalRequiredAmount
        } else {
            return 0.0
        }
    }

}
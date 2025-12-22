package io.github.smiley4.strategygame.backend.engine.application.core.actions

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent

class UpdateProductionAction : Logging {

    fun onWorldUpdatePreEconomy(gameState: GameState) {
        gameState.worldObjects
            .filter { it.hasComponent<WorldObjectComponent.Production>() && it.hasComponent<WorldObjectComponent.Economy>() }
            .forEach { worldObject ->
                val production = worldObject.getComponent<WorldObjectComponent.Production>()
                val economy = worldObject.getComponent<WorldObjectComponent.Economy>()

                // clear all economy entries for production queue
                economy.entries.removeIf { it.name.startsWith("production_queue/") }

                // add back economy entries for production queue
                production.queue.firstOrNull()?.also { currentQueueItem ->
                    currentQueueItem.resourceBatches.forEachIndexed { index, batch ->
                        economy.entries.add(
                            WorldObjectComponent.Economy.Entry(
                                name = "production_queue/batch_${index}_$batch",
                                priority = 39 - index,
                                active = true,
                                harvests = emptyMap(),
                                consumes = batch,
                                produces = emptyMap()
                            )
                        )
                    }
                }

            }
    }

    fun onWorldUpdatePostEconomy(gameState: GameState) {
        gameState.worldObjects
            .filter { it.hasComponent<WorldObjectComponent.Production>() && it.hasComponent<WorldObjectComponent.Economy>() }
            .forEach { worldObject ->
                val production = worldObject.getComponent<WorldObjectComponent.Production>()
                val economy = worldObject.getComponent<WorldObjectComponent.Economy>()

                // queue is empty -> early exit
                if (production.queue.isEmpty()) {
                    return
                }
                val currentQueueItem = production.queue.first()

                // move resources consumed by economy entries into collected resources of production queue
                economy.entries
                    .filter { it.name.startsWith("production_queue/") }
                    .filter { it.active }
                    .forEach { entry ->
                        entry.harvests.forEach { (type, amount) ->
                            production.collectedResources[type] = production.collectedResources.getOrDefault(type, 0.0) + amount
                        }
                        entry.consumes.forEach { (type, amount) ->
                            production.collectedResources[type] = production.collectedResources.getOrDefault(type, 0.0) + amount
                        }
                    }

                // check if all required resources have been collected
                var allCollected = true
                currentQueueItem.requiredResources.forEach { (type, amount) ->
                    if (production.collectedResources.getOrDefault(type, 0.0) < amount) {
                        allCollected = false
                    }
                }
                if (allCollected) {
                    production.queue.remove(currentQueueItem)
                    production.collectedResources.clear()
                    economy.entries.removeIf { it.name.startsWith("production_queue/") }
                    onComplete(gameState, worldObject, currentQueueItem)
                }

            }
    }


    private fun onComplete(
        gameState: GameState,
        worldObject: WorldObject,
        currentQueueItem: WorldObjectComponent.Production.ProductionQueueEntry
    ) {
        log().info { "Completed production queue item $currentQueueItem." }
        when (currentQueueItem) {
            is WorldObjectComponent.Production.ProductionQueueEntry.Scout -> {
                gameState.worldObjects.add(
                    WorldObject(
                        id = WorldObject.Id.gen(),
                        realm = worldObject.realm,
                        type = WorldObject.Type(
                            group = WorldObject.Group.UNIT,
                            name = "scout"
                        ),
                        tile = worldObject.tile,
                        components = mutableListOf(
                            WorldObjectComponent.Movement(
                                maxMovement = 5,
                            ),
                            WorldObjectComponent.Vision(
                                radius = 3,
                            )
                        )
                    )
                )
            }
            is WorldObjectComponent.Production.ProductionQueueEntry.Worker -> {
                gameState.worldObjects.add(
                    WorldObject(
                        id = WorldObject.Id.gen(),
                        realm = worldObject.realm,
                        type = WorldObject.Type(
                            group = WorldObject.Group.UNIT,
                            name = "worker"
                        ),
                        tile = worldObject.tile,
                        components = mutableListOf(
                            WorldObjectComponent.Movement(
                                maxMovement = 4,
                            ),
                            WorldObjectComponent.Vision(
                                radius = 1,
                            ),
                            WorldObjectComponent.Builder(
                                maxUses = 3,
                                remainingUses = 3
                            )
                        )
                    )
                )
            }
        }
    }

}
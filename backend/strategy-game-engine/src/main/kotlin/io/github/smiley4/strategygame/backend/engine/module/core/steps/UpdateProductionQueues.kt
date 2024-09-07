package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.events.UpdateWorldEvent

internal class UpdateProductionQueues : GameEventNode<UpdateWorldEvent>, Logging {

    override fun handle(event: UpdateWorldEvent, publisher: GameEventPublisher) {
        log().info("Updating production queues.")
        event.game.settlements.forEach { settlement ->
            settlement.infrastructure.productionQueue.firstOrNull()?.let { currentEntry ->
                update(event.game, settlement, currentEntry)
            }
        }
    }

    private fun update(game: GameExtended, settlement: Settlement, entry: ProductionQueueEntry) {
        entry.progress += 0.4f
        if (entry.progress >= 1f) {
            complete(game, settlement, entry)
        }
    }

    private fun complete(game: GameExtended, settlement: Settlement, entry: ProductionQueueEntry) {
        settlement.infrastructure.productionQueue.remove(entry)
        when (entry) {
            is ProductionQueueEntry.Settler -> game.worldObjects.add(
                WorldObject.Settler(
                    id = WorldObject.Id.gen(),
                    tile = settlement.tile,
                    country = settlement.country,
                    maxMovement = 3,
                    viewDistance = 1
                )
            )
        }
    }

}
package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementDirectCommandData
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementWithSettlerCommandData
import io.github.smiley4.strategygame.backend.commondata.MoveCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueRemoveEntryCommandData
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.events.ResolveCommandsEvent

internal class ResolveCommandsStep(
    private val resolveMove: ResolveCommandMove,
    private val resolveCreateSettlement: ResolveCommandCreateSettlement,
    private val resolveProductionQueue: ResolveCommandProductionQueue
) : GameEventNode<ResolveCommandsEvent>, Logging {

    override fun handle(event: ResolveCommandsEvent, publisher: GameEventPublisher) {
        log().info("Resolving ${event.commands.size} commands for game ${event.game.meta.gameId}")
        event.commands.forEach {
            try {
                @Suppress("UNCHECKED_CAST")
                when (it.data) {
                    is MoveCommandData -> resolveMove.resolve(event.game, it as Command<MoveCommandData>)
                    is CreateSettlementWithSettlerCommandData -> resolveCreateSettlement.resolve(event.game, it as Command<CreateSettlementWithSettlerCommandData>)
                    is CreateSettlementDirectCommandData -> resolveCreateSettlement.resolve(event.game, it as Command<CreateSettlementDirectCommandData>)
                    is ProductionQueueAddEntryCommandData -> resolveProductionQueue.resolve(event.game, it as Command<ProductionQueueAddEntryCommandData>)
                    is ProductionQueueRemoveEntryCommandData -> resolveProductionQueue.resolve(event.game, it as Command<ProductionQueueRemoveEntryCommandData>)
                }
            } catch (e: Exception) {
                log().warn("Failed to resolve command ${it.data} with id '${it.commandId}' - skipping command.", e)
            }
        }
    }

}

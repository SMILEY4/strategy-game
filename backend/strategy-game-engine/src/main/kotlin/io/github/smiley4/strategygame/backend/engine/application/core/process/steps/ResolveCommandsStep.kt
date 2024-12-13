package io.github.smiley4.strategygame.backend.engine.application.core.process.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.OnResolveCommandsEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.resolvecommand.ResolveCommandCreateSettlement
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.resolvecommand.ResolveCommandMove
import io.github.smiley4.strategygame.backend.engine.application.core.process.steps.resolvecommand.ResolveCommandProductionQueue
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessStep

internal class ResolveCommandsStep(
    private val resolveMove: ResolveCommandMove,
    private val resolveCreateSettlement: ResolveCommandCreateSettlement,
    private val resolveProductionQueue: ResolveCommandProductionQueue
) : ProcessStep<OnResolveCommandsEvent>, Logging {

    override suspend fun run(event: OnResolveCommandsEvent) {
        log().info("Resolving ${event.commands.size} commands for game ${event.game.meta.id}")
        event.commands.forEach {
            try {
                @Suppress("UNCHECKED_CAST")
                when (it.data) {
                    is CommandData.Move -> resolveMove.resolve(event.game, it as Command<CommandData.Move>)
                    is CommandData.CreateSettlementWithSettler -> resolveCreateSettlement.resolve(event.game, it as Command<CommandData.CreateSettlementWithSettler>)
                    is CommandData.CreateSettlementDirect -> resolveCreateSettlement.resolve(event.game, it as Command<CommandData.CreateSettlementDirect>)
                    is CommandData.ProductionQueueAddEntry -> resolveProductionQueue.resolve(event.game, it as Command<CommandData.ProductionQueueAddEntry>)
                    is CommandData.ProductionQueueRemoveEntry -> resolveProductionQueue.resolve(event.game, it as Command<CommandData.ProductionQueueRemoveEntry>)
                }
            } catch (e: Exception) {
                log().warn("Failed to resolve command ${it.data} with id '${it.id}' - skipping command.", e)
            }
        }
    }

}
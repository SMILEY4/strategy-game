package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.commondata.MoveCommandData
import io.github.smiley4.strategygame.backend.engine.module.core.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.events.ResolveCommandsEvent

class ResolveCommandsStep : GameEventNode<ResolveCommandsEvent> {

    override fun handle(event: ResolveCommandsEvent, publisher: GameEventPublisher) {
        event.commands.forEach {
            when(it.data) {
                is MoveCommandData -> {
                }
            }
        }
    }

}

package io.github.smiley4.strategygame.backend.engine.application.core.steps

import io.github.smiley4.strategygame.backend.engine.application.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.application.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.application.core.common.send
import io.github.smiley4.strategygame.backend.engine.application.core.events.ResolveCommandsEvent
import io.github.smiley4.strategygame.backend.engine.application.core.events.RootStepEvent
import io.github.smiley4.strategygame.backend.engine.application.core.events.UpdateWorldEvent

internal class RootUpdateStep : GameEventNode<RootStepEvent> {

    override fun handle(event: RootStepEvent, publisher: GameEventPublisher) {
        publisher.send(ResolveCommandsEvent(event.game, event.commands))
        publisher.send(UpdateWorldEvent(event.game))
    }

}
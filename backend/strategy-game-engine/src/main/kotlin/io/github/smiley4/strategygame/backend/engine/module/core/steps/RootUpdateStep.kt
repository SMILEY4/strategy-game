package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.events.ResolveCommandsEvent
import io.github.smiley4.strategygame.backend.engine.module.core.events.RootStepEvent
import io.github.smiley4.strategygame.backend.engine.module.core.events.UpdateWorldEvent
import io.github.smiley4.strategygame.backend.engine.module.core.common.send

class RootUpdateStep : GameEventNode<RootStepEvent> {

    override fun handle(event: RootStepEvent, publisher: GameEventPublisher) {
        publisher.send(ResolveCommandsEvent(event.game, event.commands))
        publisher.send(UpdateWorldEvent(event.game))
    }

}
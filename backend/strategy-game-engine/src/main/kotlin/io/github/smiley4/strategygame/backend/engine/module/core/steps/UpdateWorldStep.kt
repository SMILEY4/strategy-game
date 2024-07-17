package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.engine.module.core.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.events.UpdateWorldEvent

class UpdateWorldStep : GameEventNode<UpdateWorldEvent> {

    override fun handle(event: UpdateWorldEvent, publisher: GameEventPublisher) {
        TODO("Not yet implemented")
    }

}
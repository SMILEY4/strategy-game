package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.events.UpdateWorldEvent

internal class UpdateWorldStep : GameEventNode<UpdateWorldEvent>,  Logging {

    override fun handle(event: UpdateWorldEvent, publisher: GameEventPublisher) {
        log().debug("UpdateWorldStep not implemented")
    }

}
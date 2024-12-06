package io.github.smiley4.strategygame.backend.engine.application.core.process.steps

import io.github.smiley4.strategygame.backend.engine.application.core.process.events.OnResolveCommandsEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.OnUpdateWorldEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.RootEvent
import io.github.smiley4.strategygame.backend.engine.application.core.processsystem.ProcessEventPublisher
import io.github.smiley4.strategygame.backend.engine.application.core.processsystem.ProcessStep

internal class RootStep(private val publisher: ProcessEventPublisher) : ProcessStep<RootEvent> {

    override fun run(event: RootEvent) {
        publisher.publish(OnResolveCommandsEvent(event.game, event.commands))
        publisher.publish(OnUpdateWorldEvent(event.game))
    }

}
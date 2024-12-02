package io.github.smiley4.strategygame.backend.engine.application.core.processsystem

import kotlin.reflect.KType

class ProcessSystem(private val setup: ProcessSystemSetup) {

    constructor(block: ProcessSystemSetupDsl.() -> Unit) : this(setup(block))

    fun <T : ProcessEvent> publish(eventType: KType, event: T) {
        setup.sequences
            .filter { it.eventType == eventType }
            .map {
                @Suppress("UNCHECKED_CAST")
                it as ProcessSequence<T>
            }
            .forEach { sequence ->
                sequence.steps.forEach { step ->
                    step.run(event)
                }
            }
    }

}
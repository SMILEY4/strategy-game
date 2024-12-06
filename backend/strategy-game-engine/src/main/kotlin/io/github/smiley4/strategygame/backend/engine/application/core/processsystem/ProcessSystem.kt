package io.github.smiley4.strategygame.backend.engine.application.core.processsystem

import io.github.smiley4.strategygame.backend.common.logging.Logging
import kotlin.reflect.KClass
import kotlin.reflect.KType

class ProcessSystem(private val setup: ProcessSystemSetup) : Logging {

    constructor(block: ProcessSystemSetupDsl.() -> Unit) : this(setup(block))

    fun <T : ProcessEvent> publish(eventType: KType, event: T) {
        log().debug("Publish event '${(eventType.classifier as KClass<*>).simpleName}'")
        setup.sequences
            .filter { it.eventType == eventType }
            .map {
                @Suppress("UNCHECKED_CAST")
                it as ProcessSequence<T>
            }
            .forEach { sequence ->
                sequence.steps.forEach { step ->
                    log().debug("Running step ${step.javaClass.simpleName} in sequence ${sequence.name}")
                    step.run(event)
                }
            }
    }
}
package io.github.smiley4.strategygame.backend.engine.application.core.processsystem

import kotlin.reflect.KType
import kotlin.reflect.typeOf

class ProcessEventPublisher(private var system: ProcessSystem? = null) {

    fun initialize(system: ProcessSystem) {
        this.system = system
    }

    inline fun <reified T : ProcessEvent> publish(event: T) {
        publish(typeOf<T>(), event)
    }

    fun <T : ProcessEvent> publish(eventType: KType, event: T) {
        system?.publish(eventType, event) ?: throw IllegalStateException("No process system configured for publisher.")
    }

}
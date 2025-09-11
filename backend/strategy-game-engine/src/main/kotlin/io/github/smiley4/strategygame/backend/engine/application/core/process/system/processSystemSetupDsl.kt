package io.github.smiley4.strategygame.backend.engine.application.core.process.system

import kotlin.reflect.KType
import kotlin.reflect.typeOf


fun setup(block: ProcessSystemSetupDsl.() -> Unit): ProcessSystemSetup {
    return ProcessSystemSetupDsl().apply(block).build()
}


class ProcessSystemSetupDsl {

    private val sequences = mutableListOf<ProcessSequence<*>>()

    inline fun <reified T: ProcessEvent> processSequence(name: String, noinline block: ProcessSystemSequenceDsl<T>.() -> Unit) {
        return processSequence(name, typeOf<T>(), block)
    }

    fun <T: ProcessEvent> processSequence(name: String, trigger: KType, block: ProcessSystemSequenceDsl<T>.() -> Unit) {
        sequences.add(ProcessSystemSequenceDsl<T>(name, trigger).apply(block).build())
    }

    fun build(): ProcessSystemSetup {
        return ProcessSystemSetup(sequences)
    }

}


class ProcessSystemSequenceDsl<T: ProcessEvent>(private val name: String, private val eventType: KType) {

    private val steps = mutableListOf<ProcessStep<T>>()

    fun processStep(step: ProcessStep<T>) {
        steps.add(step)
    }

    fun build(): ProcessSequence<T> {
        return ProcessSequence(eventType, name, steps)
    }

}



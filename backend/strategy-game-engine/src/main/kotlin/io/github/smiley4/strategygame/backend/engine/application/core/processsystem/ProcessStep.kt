package io.github.smiley4.strategygame.backend.engine.application.core.processsystem

interface ProcessStep<T : ProcessEvent> {
    fun run(event: T)
}
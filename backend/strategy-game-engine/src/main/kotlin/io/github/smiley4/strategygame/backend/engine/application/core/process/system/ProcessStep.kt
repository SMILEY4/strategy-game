package io.github.smiley4.strategygame.backend.engine.application.core.process.system

interface ProcessStep<T : ProcessEvent> {
    suspend fun run(event: T)
}
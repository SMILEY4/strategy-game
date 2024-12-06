package io.github.smiley4.strategygame.backend.engine.application.core.processsystem

import kotlin.reflect.KType

data class ProcessSequence<T : ProcessEvent>(
    val eventType: KType,
    val name: String,
    val steps: List<ProcessStep<T>>,
)
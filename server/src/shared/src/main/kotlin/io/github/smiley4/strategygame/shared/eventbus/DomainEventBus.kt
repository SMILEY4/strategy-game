package io.github.smiley4.strategygame.shared.eventbus

import kotlinx.coroutines.flow.SharedFlow

interface DomainEvent

interface ReadableEventBus {
    val events: SharedFlow<DomainEvent>
}

interface WritableEventBus {
    suspend fun emit(event: DomainEvent)
}
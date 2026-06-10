package io.github.smiley4.strategygame.shared.eventbus

import kotlinx.coroutines.flow.SharedFlow

interface Event

interface ReadableEventBus {
    val events: SharedFlow<Event>
}

interface WritableEventBus {
    suspend fun emit(event: Event)
}
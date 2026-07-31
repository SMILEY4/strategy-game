package io.github.smiley4.strategygame.shared.eventbus

import kotlinx.coroutines.flow.SharedFlow

/**
 * Marker interface for domain events flowing through the event bus.
 */
interface Event

/**
 * Read-only side of the event bus. Subscribe to domain events via [events].
 */
interface ReadableEventBus {
    val events: SharedFlow<Event>
}

/**
 * Write-only side of the event bus. Emit domain events via [emit].
 */
interface WritableEventBus {
    suspend fun emit(event: Event)
}
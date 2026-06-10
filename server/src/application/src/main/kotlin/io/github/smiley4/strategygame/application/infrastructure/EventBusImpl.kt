package io.github.smiley4.strategygame.application.infrastructure

import io.github.smiley4.strategygame.shared.eventbus.Event
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import io.github.smiley4.strategygame.shared.eventbus.WritableEventBus
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

class EventBusImpl : ReadableEventBus, WritableEventBus {

    private val mutableEvents = MutableSharedFlow<Event>(
        replay = 0,
        extraBufferCapacity = 64,
        onBufferOverflow = BufferOverflow.SUSPEND
    )

    override val events = mutableEvents.asSharedFlow()

    override suspend fun emit(event: Event) {
        mutableEvents.emit(event)
    }

}
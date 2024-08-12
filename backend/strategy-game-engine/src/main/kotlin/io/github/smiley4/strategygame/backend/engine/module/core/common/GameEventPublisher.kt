package io.github.smiley4.strategygame.backend.engine.module.core.common

import kotlin.reflect.KType
import kotlin.reflect.typeOf

internal interface GameEventPublisher {
    fun <T> send(type: KType, event: T)

}

internal inline fun <reified T> GameEventPublisher.send(event: T) = this.send(typeOf<T>(), event)


internal class GameEventPublisherImpl : GameEventPublisher {

    private val events = mutableListOf<Pair<KType, Any>>()

    override fun <T> send(type: KType, event: T) {
        events.add(type to event as Any)
    }

    fun getEvents(): List<Pair<KType, Any>> {
        return events
    }

}
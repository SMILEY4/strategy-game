package io.github.smiley4.strategygame.backend.engine.module.core.common

internal interface GameEventNode<T> {
    fun handle(event: T, publisher: GameEventPublisher)
}
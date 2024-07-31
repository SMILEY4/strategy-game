package io.github.smiley4.strategygame.backend.engine.module.core.common

interface GameEventNode<T> {
    fun handle(event: T, publisher: GameEventPublisher)
}
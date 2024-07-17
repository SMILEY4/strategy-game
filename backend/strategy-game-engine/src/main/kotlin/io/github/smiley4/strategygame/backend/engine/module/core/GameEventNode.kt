package io.github.smiley4.strategygame.backend.engine.module.core

interface GameEventNode<T> {
    fun handle(event: T, publisher: GameEventPublisher)
}
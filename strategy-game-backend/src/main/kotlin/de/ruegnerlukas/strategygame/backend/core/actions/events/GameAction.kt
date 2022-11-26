package de.ruegnerlukas.strategygame.backend.core.actions.events

abstract class GameAction<T : GameEvent> {

    abstract suspend fun triggeredBy(): List<GameEventType>

    abstract suspend fun perform(event: T): List<GameEvent>

}
package de.ruegnerlukas.strategygame.backend.core.actions.events

abstract class GameAction<T : GameEvent>(vararg val triggeredBy: GameEventType) {

    abstract suspend fun perform(event: T): List<GameEvent>

}
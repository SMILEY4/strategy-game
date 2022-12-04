package de.ruegnerlukas.strategygame.backend.core.actions.events

import de.ruegnerlukas.strategygame.backend.shared.Logging


class GameEventManager : Logging {

    val actions = mutableMapOf<GameEventType, MutableList<GameAction<*>>>()

    fun <T : GameEvent> register(triggerEventType: GameEventType, action: GameAction<T>) {
        actions.computeIfAbsent(triggerEventType) { mutableListOf() }.add(action)
    }

    suspend fun <T : GameEvent> send(eventType: GameEventType, event: T) {
        handleEvent(eventType, event).forEach { nextEvent ->
            send(nextEvent.gameEventType, nextEvent)
        }
    }

    private suspend fun <T : GameEvent> handleEvent(eventType: GameEventType, event: T): List<GameEvent> {
        return getActions<T>(eventType)
            .also { actions -> log().debug("Handling event of type $eventType - found ${actions.size} actions") }
            .onEach { action -> log().debug("Running action ${action::class.simpleName} triggered by $eventType") }
            .flatMap { action -> action.perform(event) }
    }

    private fun <T : GameEvent> getActions(eventType: GameEventType): List<GameAction<T>> {
        @Suppress("UNCHECKED_CAST")
        return (actions[eventType] ?: emptyList()) as List<GameAction<T>>
    }

}
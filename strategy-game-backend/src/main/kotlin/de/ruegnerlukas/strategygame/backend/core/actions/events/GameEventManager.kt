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
        val actions: List<GameAction<T>> = (actions[eventType] ?: emptyList()) as List<GameAction<T>>
        log().debug("Handling event of type $eventType - found ${actions.size} actions")
        return actions.flatMap {
            log().debug("Running action ${it::class.simpleName} triggered by $eventType")
            it.perform(event)
        }
    }

}
package de.ruegnerlukas.strategygame.backend.common.eventsOLD

import de.ruegnerlukas.strategygame.backend.common.logging.Logging

class EventSystem<CONTEXT> : Logging {

    private val conditions: MutableList<EventCondition<CONTEXT, *>> = mutableListOf()

    fun <PAYLOAD> atTrigger(triggerName: String): EventCondition<CONTEXT, PAYLOAD> {
        return AtTriggerEventCondition<CONTEXT, PAYLOAD>(triggerName).also { conditions.add(it) }
    }

    fun <PAYLOAD> after(event: EventAction<CONTEXT, *, PAYLOAD>): EventCondition<CONTEXT, PAYLOAD> {
        return AfterEventCondition(event).also { conditions.add(it) }
    }

    suspend fun trigger(triggerName: String, context: CONTEXT, payload: Any) {
        log().info("Start trigger '$triggerName'")
        conditions
            .filterIsInstance<AtTriggerEventCondition<CONTEXT, *>>()
            .filter { it.triggerName == triggerName }
            .flatMap { it.getFollowingEvents() }
            .forEach { runAction(it, context, payload) }
    }

    private suspend fun <PAYLOAD, RESULT> runAction(eventAction: EventAction<CONTEXT, PAYLOAD, RESULT>, context: CONTEXT, payload: Any) {
        @Suppress("UNCHECKED_CAST") val result: RESULT = eventAction.run(context, payload as PAYLOAD)
        conditions
            .filterIsInstance<AfterEventCondition<CONTEXT, *>>()
            .filter { it.afterEvent == eventAction }
            .flatMap { it.getFollowingEvents() }
            .forEach { runAction(it, context, result as Any) }
    }


}

package de.ruegnerlukas.strategygame.backend.shared.events

open class EventCondition<CONTEXT, PAYLOAD> {

    private val followingEvents = mutableListOf<EventAction<CONTEXT, PAYLOAD, *>>()

    fun thenRun(event: EventAction<CONTEXT, PAYLOAD, *>): EventCondition<CONTEXT, PAYLOAD> {
        this.followingEvents.add(event)
        return this
    }

    fun getFollowingEvents(): List<EventAction<CONTEXT, PAYLOAD, *>> = followingEvents

}

class AtTriggerEventCondition<CONTEXT, PAYLOAD>(val triggerName: String) : EventCondition<CONTEXT, PAYLOAD>()

class AfterEventCondition<CONTEXT, PAYLOAD>(val afterEvent: EventAction<CONTEXT, *, PAYLOAD>) : EventCondition<CONTEXT, PAYLOAD>()


package io.github.smiley4.strategygame.backend.common.events

class EventNode(
    val definition: EventNodeDefinition<*, *, *, *>,
    val triggers: List<EventTriggerDefinition<*>>,
    val action: suspend (data: Any?) -> EventResult<Any?>
)
package de.ruegnerlukas.strategygame.backend.common.events

class EventNode(
    val definition: EventNodeDefinition<*, *>,
    val trigger: EventTriggerDefinition<*>,
    val action: suspend (data: Any?) -> EventResult<Any?>
)
package de.ruegnerlukas.strategygame.backend.common.events

import de.ruegnerlukas.strategygame.backend.common.logging.Logging


class EventSystem: Logging {

    private val nodes = mutableListOf<EventNode>()

    fun <IN, OUT> createNode(definition: EventNodeDefinition<IN, OUT>, block: EventNodeDsl<IN, OUT>.() -> Unit) {
        nodes.add(EventNodeDsl<IN, OUT>().apply(block).buildEventNode(definition))
    }

    fun publish(trigger: EventTriggerDefinition<Unit>) {
        publish(trigger, Unit)
    }

    fun <T> publish(trigger: EventTriggerDefinition<T>, data: T) {
        publishInternal(trigger, data as Any?)
    }

    private fun publishInternal(trigger: EventTriggerDefinition<*>, data: Any?) {
        log().debug("Evaluating event-trigger ${trigger.name()}")
        val results = nodes
            .filter { it.trigger == trigger }
            .map { node ->
                log().debug("Executing event-node ${node.definition.name()}")
                val result = node.action(data)
                val definition = node.definition
                definition to result
            }
        results.forEach { (definition, result) ->
            publishInternal(definition.after(), result)
        }
    }

}


open class EventTriggerDefinition<T>(private val name: String? = null) {
    fun name() = name ?: this::class.simpleName
}


open class EventNodeDefinition<IN, OUT> {
    private val triggerAfter = EventTriggerDefinition<OUT>(name() + "#after")
    fun after() = triggerAfter
    fun name() = this::class.simpleName
}


class EventNodeDsl<IN, OUT> {

    private var trigger: EventTriggerDefinition<IN>? = null
    private var action: ((data: IN) -> OUT)? = null

    fun trigger(trigger: EventTriggerDefinition<IN>) {
        this.trigger = trigger
    }

    fun action(block: (data: IN) -> OUT) {
        this.action = block
    }

    fun buildEventNode(definition: EventNodeDefinition<IN, OUT>): EventNode {
        @Suppress("UNCHECKED_CAST")
        return EventNode(definition, trigger!!, action!! as ((data: Any?) -> Any?))
    }

}
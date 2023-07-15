package de.ruegnerlukas.strategygame.backend.common.events

import de.ruegnerlukas.strategygame.backend.common.logging.Logging

class EventSystem : Logging {

    private val nodes = mutableListOf<EventNode>()

    fun <IN, OUT, CNL, ERR> createNode(
        definition: EventNodeDefinition<IN, OUT, CNL, ERR>,
        block: EventNodeDsl<IN, OUT, CNL, ERR>.() -> Unit
    ) {
        nodes.add(EventNodeDsl<IN, OUT, CNL, ERR>().apply(block).buildEventNode(definition))
        log().info("Creating event-node ${definition.name()}")
    }

    suspend fun publish(trigger: EventTriggerDefinition<Unit>) {
        publish(trigger, Unit)
    }

    suspend fun <T> publish(trigger: EventTriggerDefinition<T>, data: T) {
        publishInternal(trigger, data as Any?)
    }

    private suspend fun publishInternal(trigger: EventTriggerDefinition<*>, data: Any?) {
        log().debug("Evaluating event-trigger ${trigger.name()}")
        val results = getTriggeredNodes(trigger).map { node ->
            log().debug("Executing event-node ${node.definition.name()}")
            val result = node.action(data)
            val definition = node.definition
            definition to result
        }
        results.forEach { (definition, result) ->
            log().debug("Result of event-node ${definition.name()}: $result")
            when (result) {
                is OkEventResult<*> -> publishInternal(definition.after(), result.data)
                is CancelEventResult<*> -> publishInternal(definition.cancelled(), result.data)
                is ErrorEventResult<*> -> publishInternal(definition.error(), result.data)
            }
        }
    }

    private fun getTriggeredNodes(trigger: EventTriggerDefinition<*>): List<EventNode> {
        return nodes
            .filter { it.triggers.contains(trigger) }
    }

    fun generateGraphVisualization(): String {
        return StringBuilder().also { sb ->
            sb.appendLine("digraph G {")
            sb.appendLine("node[style=filled,color=gray];")
            nodes.forEach { node ->
                sb.appendLine("\"${node.definition.name()}\";")
            }
            nodes.forEach { node ->
                node.triggers.forEach { trigger ->
                    if (trigger is AfterNodeEventTriggerDefinition<*>) {
                        sb.appendLine("\"${trigger.nodeDefinition.name()}\" -> \"${node.definition.name()}\"[label=\"after\"];")
                    }
                    if (trigger is CancelNodeEventTriggerDefinition<*>) {
                        sb.appendLine("\"${trigger.nodeDefinition.name()}\" -> \"${node.definition.name()}\"[label=\"cancel\"];")
                    }
                    if (trigger is ErrorNodeEventTriggerDefinition<*>) {
                        sb.appendLine("\"${trigger.nodeDefinition.name()}\" -> \"${node.definition.name()}\"[label=\"error\"];")
                    }
                }
            }
            sb.appendLine("}")
        }.toString()
    }

}


open class EventTriggerDefinition<T>(private val name: String? = null) {
    fun name() = name ?: this::class.qualifiedName
}

class AfterNodeEventTriggerDefinition<T>(name: String?, val nodeDefinition: EventNodeDefinition<*, *, *, *>) :
    EventTriggerDefinition<T>(name)

class CancelNodeEventTriggerDefinition<T>(name: String?, val nodeDefinition: EventNodeDefinition<*, *, *, *>) :
    EventTriggerDefinition<T>(name)

class ErrorNodeEventTriggerDefinition<T>(name: String?, val nodeDefinition: EventNodeDefinition<*, *, *, *>) :
    EventTriggerDefinition<T>(name)

open class EventNodeDefinition<IN, OUT, CNL, ERR> {
    private val triggerAfter = AfterNodeEventTriggerDefinition<OUT>(name() + "#after", this)
    private val triggerCancel = CancelNodeEventTriggerDefinition<CNL>(name() + "#cancel", this)
    private val triggerError = ErrorNodeEventTriggerDefinition<ERR>(name() + "#error", this)

    fun after() = triggerAfter
    fun cancelled() = triggerCancel
    fun error() = triggerError
    fun name() = this::class.qualifiedName
}

open class BasicEventNodeDefinition<IN, OUT> : EventNodeDefinition<IN, OUT, Unit, Unit>()


class EventNodeDsl<IN, OUT, CNL, ERR> {

    private var triggers = mutableListOf<EventTriggerDefinition<IN>>()
    private var action: (suspend (data: IN) -> EventResult<*>)? = null

    fun trigger(vararg triggers: EventTriggerDefinition<IN>) {
        this.triggers.addAll(triggers)
    }

    fun action(block: suspend (data: IN) -> EventResult<*>) {
        this.action = block
    }

    fun buildEventNode(definition: EventNodeDefinition<IN, OUT, CNL, ERR>): EventNode {
        @Suppress("UNCHECKED_CAST")
        return EventNode(definition, triggers, action!! as (suspend (data: Any?) -> EventResult<Any?>))
    }

    fun eventResultOk(data: OUT) = EventResult.ok(data)
    fun eventResultCancel(data: CNL) = EventResult.cancel(data)
    fun eventResultError(data: ERR) = EventResult.error(data)
}

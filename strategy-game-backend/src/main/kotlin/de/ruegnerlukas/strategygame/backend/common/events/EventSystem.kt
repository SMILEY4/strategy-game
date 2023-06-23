package de.ruegnerlukas.strategygame.backend.common.events

import de.ruegnerlukas.strategygame.backend.common.logging.Logging

class EventSystem : Logging {

    private val nodes = mutableListOf<EventNode>()

    fun <IN, OUT> createNode(definition: EventNodeDefinition<IN, OUT>, block: EventNodeDsl<IN, OUT>.() -> Unit) {
        nodes.add(EventNodeDsl<IN, OUT>().apply(block).buildEventNode(definition))
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
        val results = nodes
            .filter { it.trigger == trigger }
            .map { node ->
                log().debug("Executing event-node ${node.definition.name()}")
                val result = node.action(data)
                val definition = node.definition
                definition to result
            }
        results.forEach { (definition, result) ->
            when (result) {
                is OkEventResult<*> -> publishInternal(definition.after(), result.data)
                else -> Unit
            }
        }
    }

    fun generateGraphVisualization(): String {
        return StringBuilder().also { sb ->
            sb.appendLine("digraph G {")
            sb.appendLine("node[style=filled,color=gray];")
            nodes.forEach { node ->
                sb.appendLine("\"${node.definition.name()}\";")
            }
            nodes.forEach { node ->
                if(node.trigger is AfterNodeEventTriggerDefinition<*>) {
                    sb.appendLine("\"${node.trigger.nodeDefinition.name()}\" -> \"${node.definition.name()}\"[label=\"after\"];")
                }
            }
            sb.appendLine("}")
        }.toString()
    }

}


open class EventTriggerDefinition<T>(private val name: String? = null) {
    fun name() = name ?: this::class.qualifiedName
}

class AfterNodeEventTriggerDefinition<T>(name: String?, val nodeDefinition: EventNodeDefinition<*,*>) : EventTriggerDefinition<T>(name)

open class EventNodeDefinition<IN, OUT> {
    private val triggerAfter = AfterNodeEventTriggerDefinition<OUT>(name() + "#after", this)
    fun after() = triggerAfter
    fun name() = this::class.qualifiedName
}


class EventNodeDsl<IN, OUT> {

    private var trigger: EventTriggerDefinition<IN>? = null
    private var action: (suspend (data: IN) -> EventResult<OUT>)? = null

    fun trigger(trigger: EventTriggerDefinition<IN>) {
        this.trigger = trigger
    }

    fun action(block: suspend (data: IN) -> EventResult<OUT>) {
        this.action = block
    }

    fun buildEventNode(definition: EventNodeDefinition<IN, OUT>): EventNode {
        @Suppress("UNCHECKED_CAST")
        return EventNode(definition, trigger!!, action!! as (suspend (data: Any?) -> EventResult<Any?>))
    }

    fun eventResultOk(data: OUT) = EventResult.ok(data)
    fun eventResultCancel() = EventResult.cancel<OUT>()
    fun eventResultError() = EventResult.error<OUT>()

}

package io.github.smiley4.strategygame.backend.engine.module.core.common

import kotlin.reflect.KType
import kotlin.reflect.typeOf

internal class GameEventSystem {

    private val nodes = mutableListOf<Pair<GameEventNode<*>, KType>>()


    inline fun <reified T : Any> register(node: GameEventNode<T>) = register(typeOf<T>(), node)

    fun <T : Any> register(type: KType, node: GameEventNode<T>) {
        nodes.add(node to type)
    }


    inline fun <reified T : Any> publish(event: T) = publish(typeOf<T>(), event)

    fun publish(type: KType, event: Any) {

        val publisher = GameEventPublisherImpl()

        getReceivers(type).forEach { node ->
            node.handle(event, publisher)
        }

        publisher.getEvents().forEach { publish(it.first, it.second) }
    }


    private fun getReceivers(type: KType): List<GameEventNode<Any>> {
        return nodes
            .filter { it.second == type }
            .map {
                @Suppress("UNCHECKED_CAST")
                it.first as GameEventNode<Any>
            }
    }

}
package io.github.smiley4.strategygame.backend.engine

import io.github.smiley4.strategygame.backend.engine.module.core.EventNode
import io.github.smiley4.strategygame.backend.engine.module.core.EventSystem
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldHaveSize

internal class EventSystemTests : FreeSpec({

    "simple event handling" {

        val handledEventsA = mutableListOf<Any>()
        val handledEventsB = mutableListOf<Any>()

        val nodeA = NodeA(handledEventsA, null)
        val nodeB = NodeB(handledEventsB, null)

        val system = EventSystem().also { it.register(listOf(nodeA, nodeB)) }

        val eventA = TestEventA("a")
        val eventB = TestEventB(42)

        system.sendEvent(eventA)
        system.sendEvent(eventB)

        handledEventsA shouldContainExactly listOf(eventA)
        handledEventsB shouldContainExactly listOf(eventB)

    }

    "with nested events" {
        val handledEventsA = mutableListOf<Any>()
        val handledEventsB = mutableListOf<Any>()

        val system = EventSystem()

        val nodeA = NodeA(handledEventsA, system)
        val nodeB = NodeB(handledEventsB)

        system.register(listOf(nodeA, nodeB))

        val eventA = TestEventA("a")

        system.sendEvent(eventA)

        handledEventsA shouldContainExactly listOf(eventA)
        handledEventsB shouldHaveSize 1
    }

}) {

    class NodeA(private val outEvents: MutableList<Any>, private val eventSystem: EventSystem? = null) : EventNode<TestEventA>(TestEventA::class) {
        override fun onEvent(event: TestEventA) {
            outEvents.add(event)
            eventSystem?.also {
                it.sendEvent(TestEventB(11))
            }
        }
    }

    class NodeB(private val outEvents: MutableList<Any>, private val eventSystem: EventSystem? = null) : EventNode<TestEventB>(TestEventB::class) {
        override fun onEvent(event: TestEventB) {
            outEvents.add(event)
            eventSystem?.also {
                it.sendEvent(TestEventA("from b"))
            }
        }
    }

    data class TestEventA(val data: String)

    data class TestEventB(val data: Int)

}
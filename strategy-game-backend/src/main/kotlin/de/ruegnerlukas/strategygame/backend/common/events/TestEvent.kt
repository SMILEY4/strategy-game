package de.ruegnerlukas.strategygame.backend.common.events

import de.ruegnerlukas.strategygame.backend.common.events.Action1.Action1Definition
import de.ruegnerlukas.strategygame.backend.common.events.Action2.Action2Definition



data class EventDataValues(val a: Int, val b: Int)
data class EventDataResult(val result: Int, val a: Int, val b: Int)

object StartTrigger : EventTriggerDefinition<Unit>()



fun main() {
    val eventSystem = EventSystem()

    Action1(eventSystem)
    Action2(eventSystem)
    Action3(eventSystem)
    Action4(eventSystem)

    eventSystem.publish(StartTrigger)

}



class Action1(eventSystem: EventSystem) {

    object Action1Definition : EventNodeDefinition<Unit, EventDataValues>()

    init {
        eventSystem.createNode(Action1Definition) {
            trigger(StartTrigger)
            action {
                println("starting system")
                eventSystem.publish(Action1Definition.after(), EventDataValues(1, 2))
                EventDataValues(4, 2)
            }
        }
    }
}


class Action2(eventSystem: EventSystem) {

    object Action2Definition : EventNodeDefinition<EventDataValues, EventDataResult>()

    init {
        eventSystem.createNode(Action2Definition) {
            trigger(Action1Definition.after())
            action { values ->
               println("calculating...")
               EventDataResult(values.a + values.b, values.a, values.b)
            }
        }
    }
}


class Action3(eventSystem: EventSystem) {

    object Action3Definition : EventNodeDefinition<EventDataValues, EventDataResult>()

    init {
        eventSystem.createNode(Action3Definition) {
            trigger(Action1Definition.after())
            action { values ->
                println("trying to calculate ${values.a} + ${values.b}")
                EventDataResult(values.a + values.b, values.a, values.b)
            }
        }
    }
}

class Action4(eventSystem: EventSystem) {

    object Action4Definition : EventNodeDefinition<EventDataResult, Unit>()

    init {
        eventSystem.createNode(Action4Definition) {
            trigger(Action2Definition.after())
            action { result ->
                println("result is ${result.result}")
            }
        }
    }
}
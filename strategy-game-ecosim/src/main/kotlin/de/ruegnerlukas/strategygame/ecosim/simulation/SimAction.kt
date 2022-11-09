package de.ruegnerlukas.strategygame.ecosim.simulation

import kotlin.reflect.KClass

abstract class SimAction(simulation: Simulation) {

    private val eventIdsIn = mutableSetOf<KClass<*>>()

    init {
        register(simulation)
    }

    private fun register(simulation: Simulation) {
        simulation.register(this)
    }

    abstract fun execute(simContext: SimContext)

    fun on(eventId: KClass<*>): SimAction {
        eventIdsIn.add(eventId)
        return this
    }

    fun getTriggers(): Set<KClass<*>> = eventIdsIn


}
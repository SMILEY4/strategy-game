package de.ruegnerlukas.strategygame.ecosim.simulation

import kotlin.reflect.KClass

class Simulation(val context: SimContext) {

    private val actions = mutableListOf<SimAction>()

    fun run() {
        val closedEvents = mutableSetOf<KClass<*>>()
        val openEvents = mutableSetOf<KClass<*>>(Simulation::class)
        while (openEvents.isNotEmpty()) {
            val currentEvent = openEvents.first()
                .also { openEvents.remove(it) }
                .also { closedEvents.add(it) }
            run(currentEvent)
                .filter { !closedEvents.contains(it) }
                .also { openEvents.addAll(it) }
        }
        context.tick++
    }

    private fun run(trigger: KClass<*>): Set<KClass<*>> {
        return getActions(trigger)
            .onEach { it.execute(context) }
            .map { it::class }
            .toSet()
    }

    private fun getActions(trigger: KClass<*>): List<SimAction> {
        return actions.filter { it.getTriggers().contains(trigger) }
    }

    fun register(action: SimAction) {
        actions.add(action)
    }

}
package io.github.smiley4.strategygame.engine.simulation.turn.tools.economy

import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ConsumptionMode
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.ConsumptionPassKey
import kotlin.uuid.Uuid

class EconomicActivitiesContainer {

    private val entries = mutableListOf<EconomicActivity>()
    private val entriesByConsumptionPass = mutableMapOf<ConsumptionPassKey, MutableList<EconomicActivity>>()

    fun add(activity: EconomicActivity) {
        entries.add(activity)
        activity.consumption?.also { consumption ->
            entriesByConsumptionPass
                .getOrPut(consumption.pass) { mutableListOf() }
                .add(activity)
        }
    }

    fun getConsumptionPassKeys(): List<ConsumptionPassKey> {
        return entriesByConsumptionPass.keys
            .toList()
            .sortedBy { it.value }
    }

    fun get(): List<EconomicActivity> {
        return entries.toList()
    }

    fun get(activityId: Uuid): EconomicActivity {
        return entries.first() { it.id == activityId }
    }

    fun get(consumptionPass: ConsumptionPassKey): List<EconomicActivity> {
        return (entriesByConsumptionPass[consumptionPass] ?: emptyList())
    }

    fun getSorted(consumptionPass: ConsumptionPassKey, mode: ConsumptionMode): List<EconomicActivity> {
        return (entriesByConsumptionPass[consumptionPass] ?: emptyList())
            .filter { it.consumption?.mode == mode }
            .sortedBy { createSortKey(it) }
    }

    fun find(predicate: (activity: EconomicActivity) -> Boolean): EconomicActivity? {
        return this.entries.find(predicate)
    }

    private fun createSortKey(activity: EconomicActivity): String {
        return when (activity.source) {
            is EconomicSource.PopulationGroupNeed -> {
                "${activity.source.entity.id}-${activity.source.popClass.value}-${activity.source.popNeed.value}"
            }
            is EconomicSource.SubsistenceFarming -> {
                "${activity.source.entity.id}-${activity.source.popClass.value}-subsistence-farming"
            }
            is EconomicSource.StructureModule -> {
                "${activity.source.entity.id}-${activity.source.structure.value}-${activity.source.module.value}"
            }
        }
    }

}

package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.shared.sumOf

/**
 * Keeps track of resource inputs and outputs and the causes/origins
 */
class ResourceLedger {

    companion object {
        fun reasonBuilding(type: BuildingType) = "building.$type"
        fun reasonPopulationFoodConsumption() = "population"
    }

    private val entries: MutableList<ResourceLedgerEntry> = mutableListOf()

    fun addEntry(resourceType: ResourceType, change: Float, reason: String) {
        this.entries.add(
            ResourceLedgerEntry(
                resourceType = resourceType,
                change = change,
                reason = reason
            )
        )
    }

    /**
     * The total change of the given resource (i.e. amount input - amount output).
     */
    fun getChangeTotal(resourceType: ResourceType): Float {
        return getEntries(resourceType).sumOf { it.change }
    }

    /**
     * The total input of the given resource
     */
    fun getChangeInput(resourceType: ResourceType): Float {
        return getEntriesInput(resourceType).sumOf { it.change }
    }

    /**
     * The total output (absolute value) of the given resource
     */
    fun getChangeOutput(resourceType: ResourceType): Float {
        return -getEntriesOutput(resourceType).sumOf { it.change }
    }

    /**
     * The input entries (i.e. entries adding some amount) for the given resource
     */
    fun getEntriesInput(resourceType: ResourceType): List<ResourceLedgerEntry> {
        return entries.filter { it.resourceType == resourceType && it.change > 0 }
    }

    /**
     * The input entries (i.e. entries removing some amount) for the given resource
     */
    fun getEntriesOutput(resourceType: ResourceType): List<ResourceLedgerEntry> {
        return entries.filter { it.resourceType == resourceType && it.change < 0 }
    }

    /**
     * The entries for the given resource
     */
    fun getEntries(resourceType: ResourceType): List<ResourceLedgerEntry> {
        return entries.filter { it.resourceType == resourceType }
    }

}

data class ResourceLedgerEntry(
    val resourceType: ResourceType,
    val change: Float,
    val reason: String,
)
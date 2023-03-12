package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack

/**
 * Something that takes part in the economy by consuming and/or producing resources. Can be located in a specific city,province or country.
 */
abstract class EconomyEntity(val power: Float, val node: EconomyNode) {
    abstract fun getConsumes(): Collection<ResourceStack>
    abstract fun getProduces(): Collection<ResourceStack>
    abstract fun allowPartialConsumption(): Boolean
}
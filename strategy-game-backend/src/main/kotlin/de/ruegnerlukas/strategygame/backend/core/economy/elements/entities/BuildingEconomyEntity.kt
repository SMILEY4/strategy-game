package de.ruegnerlukas.strategygame.backend.core.economy.elements.entities

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack

class BuildingEconomyEntity(private val owner: EconomyNode, val city: City, val building: Building) : EconomyEntity {

    private val ownedResources = mutableListOf<ResourceStack>()
    private var hasProduced = false

    override fun getNode(): EconomyNode = owner

    override fun getPriority(): Float = if (city.isProvinceCapital) 1.5f else 1f

    override fun getRequires(): Collection<ResourceStack> = getRemainingRequiredResources()

    override fun getProduces(): Collection<ResourceStack> = building.type.templateData.produces

    override fun allowPartialConsumption(): Boolean = false

    override fun isReadyToConsume(): Boolean = getRemainingRequiredResources().isNotEmpty()

    override fun isReadyToProduce(): Boolean = getRemainingRequiredResources().isEmpty() && !hasProduced

    override fun provideResources(resources: Collection<ResourceStack>) {
        ownedResources.addAll(resources)
    }

    override fun flagProduced() {
        hasProduced = true
    }

    private fun getRemainingRequiredResources(): Collection<ResourceStack> {
        return mutableListOf<ResourceStack>().also { remaining ->
            building.type.templateData.requires.forEach { required ->
                ownedResources.find { it.type == required.type }
                    ?.let { owned ->
                        val amountAvailable = owned.amount
                        val amountRemaining = required.amount - amountAvailable
                        if (amountRemaining > 0.00001) {
                            remaining.add(ResourceStack(required.type, amountRemaining))
                        }
                    }
                    ?: remaining.add(ResourceStack(required.type, required.amount))

            }
        }
    }

}
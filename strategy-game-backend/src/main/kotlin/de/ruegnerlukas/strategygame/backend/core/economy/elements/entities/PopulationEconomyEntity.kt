package de.ruegnerlukas.strategygame.backend.core.economy.elements.entities

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

class PopulationEconomyEntity(private val owner: EconomyNode, val city: City) : EconomyEntity {

    private val ownedResources = mutableListOf<ResourceStack>()
    private var hasProduced = false

    override fun getNode(): EconomyNode = owner

    override fun getPriority(): Float = if (city.isProvinceCapital) 2.5f else 2f

    override fun getRequires(): Collection<ResourceStack> = getRemainingRequiredResources()

    override fun getProduces(): Collection<ResourceStack> = emptyList()

    override fun allowPartialConsumption(): Boolean = true

    override fun isReadyToConsume(): Boolean = getRemainingRequiredResources().isNotEmpty()

    override fun isReadyToProduce(): Boolean = !hasProduced

    override fun provideResources(resources: Collection<ResourceStack>) {
        ownedResources.addAll(resources)
    }

    override fun flagProduced() {
        hasProduced = true
    }

    private fun getAmountTotalRequiredFood() =
        GameConfig.default().let { if (city.isProvinceCapital) it.cityFoodCostPerTurn else it.townFoodCostPerTurn }

    private fun getRemainingRequiredResources(): Collection<ResourceStack> {
        val requiredAmount = getAmountTotalRequiredFood()
        return mutableListOf<ResourceStack>().also { remaining ->
            val ownedAmount = ownedResources
                .filter { it.type == ResourceType.FOOD }
                .fold(0f) { sum, e -> sum + e.amount }
            val remainingAmount = requiredAmount - ownedAmount
            if (remainingAmount > 0.00001) {
                remaining.add(ResourceStack(ResourceType.FOOD, remainingAmount))
            }
        }
    }

}
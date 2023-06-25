package de.ruegnerlukas.strategygame.backend.gameengine.core.eco

import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyNode
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.common.models.resources.amount

class PopulationGrowthEconomyEntity(private val owner: EconomyNode, val city: City, val config: GameConfig) : EconomyEntity {

    private val providedResources = ResourceCollection.basic()
    private var hasProduced = false

    override fun getNode(): EconomyNode = owner

    override fun getPriority(): Float = 0f

    override fun getRequires(): ResourceCollection = getRemainingRequiredResources()

    override fun getProduces(): ResourceCollection = ResourceCollection.empty()

    override fun allowPartialConsumption(): Boolean = false

    override fun isInactive(): Boolean = false

    override fun isReadyToConsume(): Boolean = getRemainingRequiredResources().isNotEmpty()

    override fun isReadyToProduce(): Boolean = getRemainingRequiredResources().isEmpty() && !hasProduced

    override fun hasProduced(): Boolean = hasProduced

    override fun provideResources(resources: ResourceCollection) {
        providedResources.add(resources)
    }

    override fun flagProduced() {
        hasProduced = true
    }

    fun hasConsumedFood() = hasProduced()

    private fun getRemainingRequiredResources(): ResourceCollection {
        return getRequiredResources()
            .sub(providedResources)
            .trim()
    }

    private fun getRequiredResources(): ResourceCollection {
        return ResourceCollection.basic(
            ResourceType.FOOD.amount(config.popGrowthFoodCost)
        )
    }

}
package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

class MarketEconomyNode(private val game: GameExtended, private val provinces: Collection<Province>) : EconomyNode() {
    private val nodes = provinces.map { province -> ProvinceEconomyNode(game, province) }
    override fun getChildNodes() = nodes
    override fun getNodesFlatSubtree() = listOf(this) + getChildNodes().flatMap { it.getNodesFlatSubtree() }
    override fun getEntities() = emptyList<EconomyEntity>()
    override fun getAvailableResources(type: ResourceType): Float = 0f
    override fun addResources(type: ResourceType, amount: Float) = Unit
    override fun removeResources(type: ResourceType, amount: Float) = Unit
}

class ProvinceEconomyNode(
    private val game: GameExtended,
    val province: Province
) : EconomyNode() {

    private val resourcesProducedPrevTurn: ResourceStats = province.resourcesProducedPrevTurn
    private val resourcesProducedCurrTurn: ResourceStats = ResourceStats()
    private val resourcesConsumedCurrTurn: ResourceStats = ResourceStats()

    override fun getChildNodes() = emptyList<EconomyNode>()
    override fun getNodesFlatSubtree() = listOf(this) + getChildNodes().flatMap { it.getNodesFlatSubtree() }
    override fun getEntities() = province.cityIds
        .map { id -> game.cities.find { it.cityId == id }!! }
        .flatMap { city ->
            mutableListOf<EconomyEntity>().also { entities ->
                entities.addAll(city.buildings.map { BuildingEconomyEntity(it, if (city.isProvinceCapital) 1.5f else 1f) })
                entities.add(PopulationEconomyEntity(city, if (city.isProvinceCapital) 2.5f else 2f))
            }
        }
        .sortedBy { it.power }

    override fun getAvailableResources(type: ResourceType): Float = resourcesProducedPrevTurn[type] - resourcesConsumedCurrTurn[type]
    override fun addResources(type: ResourceType, amount: Float) = resourcesProducedCurrTurn.add(type, amount)
    override fun removeResources(type: ResourceType, amount: Float) = resourcesConsumedCurrTurn.add(type, amount)

    fun writeToProvince() {
        province.resourcesProducedPrevTurn = resourcesProducedPrevTurn
        province.resourcesProducedCurrTurn = resourcesProducedCurrTurn
        province.resourcesConsumedCurrTurn = resourcesConsumedCurrTurn
        province.resourcesMissing = ResourceStats()
    }

}

class BuildingEconomyEntity(private val building: Building, power: Float) : EconomyEntity(power) {
    override fun getConsumes(): Collection<ResourceStack> = building.type.templateData.requires
    override fun getProduces(): Collection<ResourceStack> = building.type.templateData.produces
    override fun allowPartialConsumption(): Boolean = false
}

class PopulationEconomyEntity(private val city: City, power: Float) : EconomyEntity(power) {
    override fun getConsumes() = listOf(ResourceStack(ResourceType.FOOD, getAmount()))
    override fun getProduces() = emptyList<ResourceStack>()
    override fun allowPartialConsumption(): Boolean = true
    private fun getAmount() = GameConfig.default().let { if (city.isProvinceCapital) it.cityFoodCostPerTurn else it.townFoodCostPerTurn }
}
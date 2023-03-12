package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.core.actions.update.MarketNetwork
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

class WorldEconomyNode(game: GameExtended) : EconomyNode() {

    val nodes = buildChildNodes(game)

    override fun getChildNodes() = nodes
    override fun getEntities() = emptyList<EconomyEntity>()

    override fun getAvailableResources(type: ResourceType): Float = 0f
    override fun addResources(type: ResourceType, amount: Float) = Unit
    override fun removeResources(type: ResourceType, amount: Float) = Unit

    private fun buildChildNodes(game: GameExtended): List<EconomyNode> {
        val networks = MarketNetwork.networksFrom(game)
        val provincesInNetworks = networks.flatMap { it.getProvinces() }
        val nodes = networks.map { MarketEconomyNode(game, it.getProvinces()) }.toMutableList()
        game.provinces
            .filter { province -> !provincesInNetworks.contains(province) }
            .forEach { nodes.add(MarketEconomyNode(game, listOf(it))) }
        return nodes
    }

}

class MarketEconomyNode(private val game: GameExtended, provinces: Collection<Province>) : EconomyNode() {
    private val nodes = provinces.map { province -> ProvinceEconomyNode(game, province) }
    override fun getChildNodes() = nodes
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

    private val entities = province.cityIds
        .map { id -> game.cities.find { it.cityId == id }!! }
        .flatMap { city ->
            mutableListOf<EconomyEntity>().also { entities ->
                entities.addAll(city.buildings.map { BuildingEconomyEntity(it, if (city.isProvinceCapital) 1.5f else 1f) })
                entities.add(PopulationEconomyEntity(city, if (city.isProvinceCapital) 2.5f else 2f))
            }
        }
        .sortedBy { it.power }

    override fun getChildNodes() = emptyList<EconomyNode>()
    override fun getEntities() = entities

    override fun getAvailableResources(type: ResourceType): Float = resourcesProducedPrevTurn[type] - resourcesConsumedCurrTurn[type]
    override fun addResources(type: ResourceType, amount: Float) = resourcesProducedCurrTurn.add(type, amount)
    override fun removeResources(type: ResourceType, amount: Float) = resourcesConsumedCurrTurn.add(type, amount)

    fun writeToProvince(ctx: EconomyUpdateContext) {
        province.resourcesProducedPrevTurn = resourcesProducedPrevTurn
        province.resourcesProducedCurrTurn = resourcesProducedCurrTurn
        province.resourcesConsumedCurrTurn = resourcesConsumedCurrTurn
        province.resourcesMissing = ResourceStats()
        getEntitiesRecursive()
            .map { ctx.getEntityState(it) }
            .filter { it.state == EntityStateType.MISSING_RESOURCES }
            .flatMap { it.remainingResources }
            .forEach { province.resourcesMissing.add(it) }
    }

}

class BuildingEconomyEntity(private val building: Building, power: Float) : EconomyEntity(power) {
    override fun getConsumes(): Collection<ResourceStack> = building.type.templateData.requires
    override fun getProduces(): Collection<ResourceStack> = building.type.templateData.produces
    override fun allowPartialConsumption(): Boolean = false

    override fun toString() = "BuildingEconomyEntity#${building.type}"
}

class PopulationEconomyEntity(private val city: City, power: Float) : EconomyEntity(power) {
    override fun getConsumes() = listOf(ResourceStack(ResourceType.FOOD, getAmount()))
    override fun getProduces() = emptyList<ResourceStack>()
    override fun allowPartialConsumption(): Boolean = true
    private fun getAmount() = GameConfig.default().let { if (city.isProvinceCapital) it.cityFoodCostPerTurn else it.townFoodCostPerTurn }

    override fun toString() = "PopulationEconomyEntity#${city.name}"

}
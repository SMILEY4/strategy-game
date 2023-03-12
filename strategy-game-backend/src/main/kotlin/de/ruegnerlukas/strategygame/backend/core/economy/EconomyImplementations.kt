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

    private val nodes: Collection<EconomyNode> = buildChildNodes(game)
    private val storage: EconomyResourceStorage = DistributedEconomyResourceStorage(this, nodes.map { it.getStorage() })

    override fun getChildNodes() = nodes
    override fun getEntities() = emptyList<EconomyEntity>()
    override fun getStorage() = storage

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
    private val nodes: Collection<EconomyNode> = provinces.map { province -> ProvinceEconomyNode(game, province) }
    private val storage = DistributedEconomyResourceStorage(this, nodes.map { it.getStorage() })
    override fun getChildNodes() = nodes
    override fun getEntities() = emptyList<EconomyEntity>()
    override fun getStorage() = storage
}

class ProvinceEconomyNode(
    private val game: GameExtended,
    val province: Province
) : EconomyNode() {

    private val storage = LocalEconomyResourceStorage(this, province.resourcesProducedPrevTurn)

    private val entities = province.cityIds
        .map { id -> game.cities.find { it.cityId == id }!! }
        .flatMap { city ->
            mutableListOf<EconomyEntity>().also { entities ->
                entities.addAll(city.buildings.map { BuildingEconomyEntity(it, if (city.isProvinceCapital) 1.5f else 1f, this) })
                entities.add(PopulationEconomyEntity(city, if (city.isProvinceCapital) 2.5f else 2f, this))
            }
        }
        .sortedBy { it.power }

    override fun getChildNodes() = emptyList<EconomyNode>()
    override fun getEntities() = entities
    override fun getStorage() = storage

    fun write(ctx: EconomyUpdateContext) {
        province.resourcesProducedCurrTurn = storage.getAddedResources()
        province.resourcesConsumedCurrTurn = storage.getRemovedResources()
        province.resourcesMissing = ResourceStats()
        getEntitiesRecursive()
            .map { ctx.getEntityState(it) }
            .filter { it.state == EntityStateType.MISSING_RESOURCES }
            .flatMap { it.remainingResources }
            .forEach { province.resourcesMissing.add(it) }
    }

}

class BuildingEconomyEntity(private val building: Building, power: Float, node: EconomyNode) : EconomyEntity(power, node) {
    override fun getConsumes(): Collection<ResourceStack> = building.type.templateData.requires
    override fun getProduces(): Collection<ResourceStack> = building.type.templateData.produces
    override fun allowPartialConsumption(): Boolean = false

    override fun toString() = "BuildingEconomyEntity#${building.type}"
}

class PopulationEconomyEntity(private val city: City, power: Float, node: EconomyNode) : EconomyEntity(power, node) {
    override fun getConsumes() = listOf(ResourceStack(ResourceType.FOOD, getAmount()))
    override fun getProduces() = emptyList<ResourceStack>()
    override fun allowPartialConsumption(): Boolean = true
    private fun getAmount() = GameConfig.default().let { if (city.isProvinceCapital) it.cityFoodCostPerTurn else it.townFoodCostPerTurn }

    override fun toString() = "PopulationEconomyEntity#${city.name}"

}
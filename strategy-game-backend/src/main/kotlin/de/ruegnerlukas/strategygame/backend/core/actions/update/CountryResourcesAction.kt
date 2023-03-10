package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import kotlin.math.min

/**
 * Handles turn-income and turn-expenses
 */
class CountryResourcesAction(private val gameConfig: GameConfig) {

    fun perform(game: GameExtended) {
        val networks = MarketNetwork.networksFrom(game)
        val ecoEntities = collectEcoEntities(game)

        // first pass: local resource access only
        val resultLocalPass = ecoEntities.map { it to handleLocal(it) }

        // second pass: use resources from network
        val resultNetworkPass = resultLocalPass.map { (entity, resultLocal) ->
            if (resultLocal.type == EcoEntityResultType.MISSING_RESOURCES) {
                MarketNetwork.findNetwork(networks, entity.province)?.let { network ->
                    entity to handleNetwork(entity, network, resultLocal)
                } ?: (entity to resultLocal)
            } else {
                entity to resultLocal
            }
        }

        // entities that are missing resources
        resultNetworkPass
            .filter { it.second.type == EcoEntityResultType.MISSING_RESOURCES }
            .forEach { (entity, result) ->
                result.missingResources.forEach { resourceStack ->
                    entity.province.resourcesMissing.add(resourceStack.type, resourceStack.amount)
                }
            }
    }

    private fun collectEcoEntities(game: GameExtended): List<EcoEntity> {
        val entities = mutableListOf<EcoEntity>()
        game.cities.forEach { city ->
            val province = getProvinceByCity(game, city.cityId)
            city.buildings.forEach { building ->
                entities.add(
                    BuildingEcoEntity(
                        power = if (city.isProvinceCapital) 1.5f else 1f,
                        countryId = province.countryId,
                        province = province,
                        city = city,
                        building = building,
                    )
                )
            }
            entities.add(
                PopulationEcoEntity(
                    power = if (city.isProvinceCapital) 2.5f else 2f,
                    countryId = province.countryId,
                    province = province,
                    city = city,
                )
            )
        }
        return entities.sortedBy { it.power }
    }

    private fun handleLocal(entity: EcoEntity): EcoEntityResult {
        return when (entity) {
            is BuildingEcoEntity -> handleLocal(entity)
            is PopulationEcoEntity -> handleLocal(entity)
        }
    }

    private fun handleLocal(entity: BuildingEcoEntity): EcoEntityResult {
        val province = entity.province
        val building = entity.building
        if (!fulfillsTileRequirement(building)) {
            return EcoEntityResult.missingTileRequirement()
        }
        if (areResourcesAvailableLocally(province, building)) {
            building.type.templateData.requires.forEach { takeFromProvince(province, it) }
            building.type.templateData.produces.forEach { giveToProvince(province, it) }
            return EcoEntityResult.complete()
        } else {
            return EcoEntityResult.missingResources(building.type.templateData.requires)
        }
    }

    private fun handleLocal(entity: PopulationEcoEntity): EcoEntityResult {
        val requiredFoodAmount = calculateFoodConsumption(entity.city)
        val possibleFoodAmount = min(requiredFoodAmount, availableResourceAmount(entity.province, ResourceType.FOOD))
        val missingFoodAmount = requiredFoodAmount - possibleFoodAmount
        entity.province.resourcesConsumedCurrTurn.add(ResourceType.FOOD, possibleFoodAmount)
        if (missingFoodAmount > 0) {
            return EcoEntityResult.missingResources(listOf(ResourceStack(type = ResourceType.FOOD, amount = missingFoodAmount)))
        } else {
            return EcoEntityResult.complete()
        }
    }

    private fun handleNetwork(entity: EcoEntity, network: MarketNetwork, resultLocal: EcoEntityResult): EcoEntityResult {
        return when (entity) {
            is BuildingEcoEntity -> handleNetwork(entity, network)
            is PopulationEcoEntity -> handleNetwork(entity, network, resultLocal)
        }
    }

    private fun handleNetwork(entity: BuildingEcoEntity, network: MarketNetwork): EcoEntityResult {
        network.calculateResourceStats()
        val province = entity.province
        val building = entity.building
        if (building.type.templateData.requiredTileResource != null) {
            return EcoEntityResult.missingTileRequirement()
        }
        if (areResourcesAvailableInNetwork(network, building.type.templateData.requires)) {
            building.type.templateData.requires.forEach { takeFromProvince(province, it) }
            building.type.templateData.produces.forEach { giveToProvince(province, it) }
            return EcoEntityResult.complete()
        } else {
            return EcoEntityResult.missingResources(building.type.templateData.requires)
        }
    }

    private fun handleNetwork(entity: PopulationEcoEntity, network: MarketNetwork, resultLocal: EcoEntityResult): EcoEntityResult {
        network.calculateResourceStats()
        val requiredFoodAmount = resultLocal.missingResources.find { it.type == ResourceType.FOOD }?.amount ?: 0f
        val possibleFoodAmount = min(requiredFoodAmount, availableResourceAmount(network, ResourceType.FOOD))
        val missingFoodAmount = requiredFoodAmount - possibleFoodAmount
        entity.province.resourcesConsumedCurrTurn.add(ResourceType.FOOD, possibleFoodAmount)
        if (missingFoodAmount > 0) {
            return EcoEntityResult.missingResources(listOf(ResourceStack(ResourceType.FOOD, missingFoodAmount)))
        } else {
            return EcoEntityResult.complete()
        }
    }

    private fun fulfillsTileRequirement(building: Building): Boolean {
        return building.type.templateData.requiredTileResource == null || building.tile != null
    }

    private fun availableResourceAmount(province: Province, type: ResourceType): Float {
        return province.resourcesProducedPrevTurn[type] - province.resourcesConsumedCurrTurn[type]
    }

    private fun availableResourceAmount(network: MarketNetwork, type: ResourceType): Float {
        return network.resourcesProducedPrevTurn[type] - network.resourcesConsumedCurrTurn[type]
    }

    private fun isResourceAvailable(province: Province, type: ResourceType, amount: Float): Boolean {
        return availableResourceAmount(province, type) >= amount
    }

    private fun areResourcesAvailableLocally(province: Province, building: Building): Boolean {
        return building.type.templateData.requires.all { isResourceAvailable(province, it.type, it.amount) }
    }

    private fun isResourceAvailable(network: MarketNetwork, type: ResourceType, amount: Float): Boolean {
        return availableResourceAmount(network, type) >= amount
    }

    private fun areResourcesAvailableInNetwork(network: MarketNetwork, requiredResources: Collection<ResourceStack>): Boolean {
        return requiredResources.all { isResourceAvailable(network, it.type, it.amount) }
    }

    private fun takeFromProvince(province: Province, resourceStack: ResourceStack) {
        province.resourcesConsumedCurrTurn.add(resourceStack.type, resourceStack.amount)
    }

    private fun giveToProvince(province: Province, resourceStack: ResourceStack) {
        province.resourcesProducedCurrTurn.add(resourceStack.type, resourceStack.amount)
    }

    private fun calculateFoodConsumption(city: City): Float {
        return if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
    }

    private fun getProvinceByCity(game: GameExtended, cityId: String): Province {
        return game.provinces.find { it.cityIds.contains(cityId) }!!
    }

}

internal sealed class EcoEntity(
    val power: Float,
    val province: Province
)

internal class BuildingEcoEntity(
    power: Float,
    province: Province,
    val countryId: String,
    val city: City,
    val building: Building
) : EcoEntity(power, province) {

    override fun toString(): String {
        return "BuildingEcoEntity(countryId='$countryId', province=${province.provinceId}, city=${city.cityId}, building=${building.type.name})"
    }
}

internal class PopulationEcoEntity(
    power: Float,
    province: Province,
    val countryId: String,
    val city: City,
) : EcoEntity(power, province) {

    override fun toString(): String {
        return "PopulationEcoEntity(countryId='$countryId', province=${province.provinceId}, city=${city.cityId})"
    }
}

internal data class EcoEntityResult(
    val type: EcoEntityResultType,
    val missingResources: List<ResourceStack>
) {
    companion object {

        fun complete() = EcoEntityResult(
            type = EcoEntityResultType.COMPLETE,
            missingResources = listOf()
        )

        fun missingTileRequirement() = EcoEntityResult(
            type = EcoEntityResultType.MISSING_TILE_REQUIREMENT,
            missingResources = listOf()
        )

        fun missingResources(resources: List<ResourceStack>) = EcoEntityResult(
            type = EcoEntityResultType.MISSING_RESOURCES,
            missingResources = resources.toList()
        )

    }
}

internal enum class EcoEntityResultType {
    COMPLETE,
    MISSING_TILE_REQUIREMENT,
    MISSING_RESOURCES
}
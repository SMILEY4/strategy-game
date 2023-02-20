package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventResourcesUpdate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
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
 * - triggered by [GameEventWorldUpdate]
 * - triggers nothing
 */
class GameActionCountryResources(
    private val gameConfig: GameConfig
) : GameAction<GameEventWorldUpdate>(GameEventWorldUpdate.TYPE) {

    override suspend fun perform(event: GameEventWorldUpdate): List<GameEvent> {
        val networks = MarketNetwork.networksFrom(event.game)
        var ecoEntities = collectEcoEntities(event.game)

        // first pass: local resource access only
        ecoEntities = ecoEntities
            .map { it to handleLocal(it) }
            .filter { !it.second }
            .map { it.first }

        // second pass: use resources from network
        ecoEntities = ecoEntities
            .map { it to handleNetwork(it, MarketNetwork.findNetwork(networks, it.province)!!) }
            .filter { !it.second }
            .map { it.first }

        // entities that are missing resources
        println("MISSING RESOURCES:")
        ecoEntities.forEach { println(it.toString()) }

        return listOf(GameEventResourcesUpdate(event.game))
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

    private fun handleLocal(entity: EcoEntity): Boolean {
        return when (entity) {
            is BuildingEcoEntity -> handleLocal(entity)
            is PopulationEcoEntity -> handleLocal(entity)
        }
    }

    private fun handleLocal(entity: BuildingEcoEntity): Boolean {
        val province = entity.province
        val building = entity.building
        if (building.type.templateData.requiredTileResource != null && building.tile == null) {
            return false
        }
        if (!areResourcesAvailableLocally(province, building.type.templateData.requires)) {
            building.type.templateData.requires.forEach { // TODO: fix bug: resources added to missing 2x
                province.resourcesMissing.add(it.type, it.amount)
            }
            return false
        }
        building.type.templateData.requires.forEach { requiredResource ->
            province.resourcesConsumedCurrTurn.add(requiredResource.type, requiredResource.amount)
        }
        building.type.templateData.produces.forEach { producedResource ->
            province.resourcesProducedCurrTurn.add(producedResource.type, producedResource.amount)
        }
        return true
    }

    private fun handleLocal(entity: PopulationEcoEntity): Boolean {
        val city = entity.city
        val province = entity.province
        val requiredFoodAmount = if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
        val possibleFoodAmount = min(requiredFoodAmount, availableResourceAmount(province, ResourceType.FOOD))
        val missingFoodAmount = requiredFoodAmount - possibleFoodAmount
        province.resourcesConsumedCurrTurn.add(ResourceType.FOOD, possibleFoodAmount)
        if (missingFoodAmount > 0) {
            province.resourcesMissing.add(ResourceType.FOOD, missingFoodAmount) // TODO: fix bug: resources added to missing 2x
            return false
        }
        return true
    }

    private fun handleNetwork(entity: EcoEntity, network: MarketNetwork): Boolean {
        return when (entity) {
            is BuildingEcoEntity -> handleNetwork(entity, network)
            is PopulationEcoEntity -> handleNetwork(entity, network)
        }
    }

    private fun handleNetwork(entity: BuildingEcoEntity, network: MarketNetwork): Boolean {
        network.calculateResourceStats()
        val province = entity.province
        val building = entity.building
        if (building.type.templateData.requiredTileResource != null) {
            return false
        }
        if (!areResourcesAvailableInNetwork(network, building.type.templateData.requires)) {
            building.type.templateData.requires.forEach { // TODO: fix bug: resources added to missing 2x
                province.resourcesMissing.add(it.type, it.amount)
            }
            return false
        }
        building.type.templateData.requires.forEach { requiredResource ->
            province.resourcesConsumedCurrTurn.add(requiredResource.type, requiredResource.amount)
        }
        building.type.templateData.produces.forEach { producedResource ->
            province.resourcesProducedCurrTurn.add(producedResource.type, producedResource.amount)
        }
        return true
    }

    private fun handleNetwork(entity: PopulationEcoEntity, network: MarketNetwork): Boolean {
        network.calculateResourceStats()
        val city = entity.city
        val province = entity.province
        val requiredFoodAmount = if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
        val possibleFoodAmount = min(requiredFoodAmount, availableResourceAmount(network, ResourceType.FOOD))
        val missingFoodAmount = requiredFoodAmount - possibleFoodAmount
        province.resourcesConsumedCurrTurn.add(ResourceType.FOOD, possibleFoodAmount)
        println("      population consumed food ${possibleFoodAmount}x")
        if (missingFoodAmount > 0) {
            province.resourcesMissing.add(ResourceType.FOOD, missingFoodAmount) // TODO: fix bug: resources added to missing 2x
            println("      population is missing food ${missingFoodAmount}x")
            return false
        }
        return true
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

    private fun areResourcesAvailableLocally(province: Province, requiredResources: Collection<ResourceStack>): Boolean {
        return requiredResources.all { isResourceAvailable(province, it.type, it.amount) }
    }

    private fun isResourceAvailable(network: MarketNetwork, type: ResourceType, amount: Float): Boolean {
        return availableResourceAmount(network, type) >= amount
    }

    private fun areResourcesAvailableInNetwork(network: MarketNetwork, requiredResources: Collection<ResourceStack>): Boolean {
        return requiredResources.all { isResourceAvailable(network, it.type, it.amount) }

    }

    private fun getCity(game: GameExtended, cityId: String): City {
        return game.cities.find { it.cityId == cityId }!!
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
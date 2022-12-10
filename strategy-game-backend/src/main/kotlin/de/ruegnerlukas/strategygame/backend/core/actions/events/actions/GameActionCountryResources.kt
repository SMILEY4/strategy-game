package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.shared.Logging

/**
 * Handles turn-income and turn-expenses
 * - triggered by [GameEventWorldUpdate]
 * - triggers nothing
 */
class GameActionCountryResources(
    private val gameConfig: GameConfig
) : GameAction<GameEventWorldUpdate>(GameEventWorldUpdate.TYPE) {

    override suspend fun perform(event: GameEventWorldUpdate): List<GameEvent> {
        event.game.provinces.forEach { province ->

            val log = ResourcesLog(province)

            val resourcesLastTurn = province.resourceBalance.toMutableMap()
            val resourcesThisTurn = mutableMapOf<ResourceType, Float>().also {
                ResourceType.values().forEach { resourceType ->
                    it[resourceType] = 0f
                }
            }

            log.previousTurn.putAll(resourcesLastTurn)

            province.cityIds
                .map { getCity(event.game, it) }
                .sortedBy { it.isProvinceCapital }
                .forEach {
                    handleCityProduction(it, resourcesLastTurn, resourcesThisTurn, log)
                    handleCityFoodConsumption(it, resourcesLastTurn, log)
                }

            province.resourceBalance.also {
                it.clear()
                it.putAll(resourcesThisTurn)
            }

            log.nextTurn.putAll(resourcesThisTurn)
            log.print()
        }
        return listOf()
    }


    private fun handleCityProduction(
        city: City,
        resourcesLastTurn: MutableMap<ResourceType, Float>,
        resourcesThisTurn: MutableMap<ResourceType, Float>,
        log: ResourcesLog
    ) {
        city.buildings
            .filter { it.type.templateData.requiredTileResource == null || it.tile != null }
            .filter { resourcesAvailable(it.type.templateData.requires, resourcesLastTurn) }
            .sortedBy { it.type.order }
            .forEach { building ->
                building.type.templateData.requires.forEach { requiredResource ->
                    addResourceBalance(requiredResource.type, -requiredResource.amount, resourcesLastTurn)
                    log.changes[requiredResource.type]!!.add("building:" + building.type to -requiredResource.amount)
                }
                building.type.templateData.produces.forEach { producedResource ->
                    addResourceBalance(producedResource.type, +producedResource.amount, resourcesThisTurn)
                    log.changes[producedResource.type]!!.add("building:" + building.type to +producedResource.amount)
                }
            }
    }


    private fun handleCityFoodConsumption(city: City, resourcesLastTurn: MutableMap<ResourceType, Float>, log: ResourcesLog) {
        val foodConsumption = if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
        addResourceBalance(ResourceType.FOOD, -foodConsumption, resourcesLastTurn)
        log.changes[ResourceType.FOOD]!!.add("consumption" to -foodConsumption)
    }


    private fun getCity(game: GameExtended, cityId: String): City {
        return game.cities.find { it.cityId == cityId }!!
    }


    private fun resourcesAvailable(requiredResources: List<ResourceStack>, values: Map<ResourceType, Float>): Boolean {
        return requiredResources.all { getResourceBalance(it.type, values) >= it.amount }
    }


    private fun getResourceBalance(type: ResourceType, values: Map<ResourceType, Float>): Float {
        return values[type] ?: 0F
    }


    private fun addResourceBalance(type: ResourceType, addAmount: Float, values: MutableMap<ResourceType, Float>) {
        values[type] = getResourceBalance(type, values) + addAmount
    }


    data class ResourcesLog(
        val province: Province,
        val previousTurn: MutableMap<ResourceType, Float> = mutableMapOf(),
        val nextTurn: MutableMap<ResourceType, Float> = mutableMapOf(),
        val changes: MutableMap<ResourceType, MutableList<Pair<String, Float>>> = mutableMapOf<ResourceType, MutableList<Pair<String, Float>>>().also {
            ResourceType.values().forEach { resource -> it[resource] = mutableListOf<Pair<String, Float>>() }
        }
    ) {

        fun print() {
            val log = Logging.create("Resource Update")
            log.debug("== ${this.province.provinceId} ============ ")
            log.debug("----- LAST TURN -----")
            this.previousTurn.forEach { (resource, amount) ->
                log.debug("  - $resource: " + amount.toString().padStart(4))
            }
            log.debug("----- NEXT TURN -----")
            this.nextTurn.forEach { (resource, amount) ->
                log.debug("  - $resource: " + amount.toString().padStart(4))
            }
            log.debug("----- CHANGES -----")
            this.changes.forEach { (resource, entries) ->
                log.debug("  - $resource:")
                entries.forEach { entry ->
                    log.debug("     * ${entry.first}: ${entry.second}")
                }
            }
            log.debug("===========================================")
        }

    }


}
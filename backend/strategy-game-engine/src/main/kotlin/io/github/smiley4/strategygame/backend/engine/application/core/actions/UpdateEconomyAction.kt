package io.github.smiley4.strategygame.backend.engine.application.core.actions

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import kotlin.math.max
import kotlin.math.min

class UpdateEconomyAction : Logging {

    fun onWorldUpdate(gameState: GameState) {
        log().debug { "Updating economy..." }
        prepare(gameState)
        updateConsumption(gameState)
        updateProduction(gameState)
        val tradeOffers = collectTradeOffers(gameState)
        resolveTradeOffers(tradeOffers)
        limitResourceStorage(gameState)
        log().debug { "...done with economy update" }
    }


    private fun prepare(gameState: GameState) {
        log().debug { "... prepare" }
        gameState.worldObjects
            .filter { it.hasComponent<WorldObjectComponent.Economy>() }
            .forEach { worldObject ->
                val economyComponent = worldObject.getComponent<WorldObjectComponent.Economy>()
                economyComponent.log.clear()
            }
    }

    private fun updateConsumption(gameState: GameState) {
        log().debug { "... update consumption" }

        // for each world object
        gameState.worldObjects
            .filter { it.hasComponent<WorldObjectComponent.Economy>() }
            .forEach { worldObject ->
                val tile = gameState.tiles.get(worldObject.tile) ?: throw Exception("Could not find tile")
                val economyComponent = worldObject.getComponent<WorldObjectComponent.Economy>()

                // for each economy entry
                economyComponent.entries
                    .sortedBy { it.name }
                    .forEach { entry ->

                        // check: all required resources available?
                        entry.active = true
                        entry.harvests.forEach { (type, amount) ->
                            if (tile.dataWorld.resources.none { it.type == type && it.amount >= amount }) {
                                entry.active = false
                                economyComponent.log.add(
                                    WorldObjectComponent.Economy.Log(
                                        logType = "missing_resources_harvest",
                                        entryName = entry.name,
                                        resourceType = type,
                                        amount = amount
                                    )
                                )
                                log().debug { "     ... ${worldObject.type.group}/${worldObject.type.name} . ${entry.name} is missing tile resources" }
                            }
                        }
                        entry.consumes.forEach { (type, amount) ->
                            if (!economyComponent.storage.hasAmount(type, amount)) {
                                entry.active = false
                                economyComponent.log.add(
                                    WorldObjectComponent.Economy.Log(
                                        logType = "missing_resources_consume",
                                        entryName = entry.name,
                                        resourceType = type,
                                        amount = amount
                                    )
                                )
                                log().debug { "     ... ${worldObject.type.group}/${worldObject.type.name} . ${entry.name} is missing resources" }
                            }
                        }

                        // consume all required resources
                        if (entry.active) {
                            entry.harvests.forEach { (type, amount) ->
                                val resourceNode = tile.dataWorld.resources.find { it.type == type && it.amount >= amount }
                                resourceNode?.amount -= amount
                            }
                            entry.consumes.forEach { (type, amount) ->
                                economyComponent.storage.retrieve(type, amount)
                                economyComponent.log.add(
                                    WorldObjectComponent.Economy.Log(
                                        logType = "consumed_resources",
                                        entryName = entry.name,
                                        resourceType = type,
                                        amount = amount
                                    )
                                )
                                log().debug { "     ... ${worldObject.type.group}/${worldObject.type.name} . ${entry.name} consumed resources" }
                            }
                        }

                    }
            }
    }

    private fun updateProduction(gameState: GameState) {
        log().debug { "... update production" }

        // for each world object
        gameState.worldObjects
            .filter { it.hasComponent<WorldObjectComponent.Economy>() }
            .forEach { worldObject ->
                val economyComponent = worldObject.getComponent<WorldObjectComponent.Economy>()

                // for each economy entry
                economyComponent.entries
                    .sortedBy { it.name }
                    .forEach { entry ->

                        // produce resources if active
                        if (entry.active) {
                            entry.produces.forEach { (type, amount) ->
                                economyComponent.storage.store(type, amount)
                                economyComponent.log.add(
                                    WorldObjectComponent.Economy.Log(
                                        logType = "produced_resources",
                                        entryName = entry.name,
                                        resourceType = type,
                                        amount = amount
                                    )
                                )
                                log().debug { "     ... ${worldObject.type.group}/${worldObject.type.name} . ${entry.name} produced resources" }
                            }
                        }

                    }
            }
    }

    private fun collectTradeOffers(gameState: GameState): List<TradeOffer> {
        log().debug { "... collect trade offers" }

        val tradeOffers = mutableListOf<TradeOffer>()

        // for each world object
        gameState.worldObjects
            .filter { it.hasComponent<WorldObjectComponent.Economy>() }
            .forEach { worldObject ->
                val economyComponent = worldObject.getComponent<WorldObjectComponent.Economy>()

                // for each resource type
                ResourceType.entries.forEach { resourceType ->

                    // calculate target stockpile it wants to keep
                    val totalDemand = economyComponent.entries.sumOf { it.consumes.getOrDefault(resourceType, 0.0) }
                    val targetStockpile = totalDemand + 0.0

                    // calculate required import amount
                    val importNeed = max(0.0, targetStockpile - economyComponent.storage.getAmount(resourceType))
                    if (importNeed > 0.0) {
                        tradeOffers.add(TradeOffer.Import(worldObject, resourceType, importNeed))
                        log().debug { "     ... ${worldObject.type.group}/${worldObject.type.name} wants to import $importNeed $resourceType" }
                    }

                    // calculate possible export amount
                    val possibleExport = max(0.0, economyComponent.storage.getAmount(resourceType) - targetStockpile)
                    if (possibleExport > 0.0) {
                        tradeOffers.add(TradeOffer.Export(worldObject, resourceType, possibleExport))
                        log().debug { "     ... ${worldObject.type.group}/${worldObject.type.name} wants to export $possibleExport $resourceType" }
                    }
                }

            }

        return tradeOffers
    }

    private fun resolveTradeOffers(tradeOffers: List<TradeOffer>) {
        log().debug { "... resolve trade offers" }

        val openImportOffers = tradeOffers.filterIsInstance<TradeOffer.Import>().toMutableList()
        val openExportOffers = tradeOffers.filterIsInstance<TradeOffer.Export>().toMutableList()

        while (openImportOffers.isNotEmpty() && openExportOffers.isNotEmpty()) {
            val currentImport = openImportOffers.removeFirst()

            // find a matching export offer
            val matchingExport = openExportOffers.find { it.type == currentImport.type }
            openExportOffers.remove(matchingExport)

            // no export offer found -> import demand can not be met, delete import demand
            if (matchingExport == null) {
                log().debug { "     ... ${currentImport.worldObject.type.group}/${currentImport.worldObject.type.name} import could not be fulfilled" }
                continue
            }

            // resolve trade / import export pair
            val tradeAmount = min(currentImport.amount, matchingExport.amount)
            val remainingImportAmount = currentImport.amount - tradeAmount
            val remainingExportAmount = matchingExport.amount - tradeAmount

            currentImport.worldObject.getComponent<WorldObjectComponent.Economy>().storage.store(matchingExport.type, tradeAmount)
            matchingExport.worldObject.getComponent<WorldObjectComponent.Economy>().storage.retrieve(matchingExport.type, tradeAmount)
            currentImport.worldObject.getComponent<WorldObjectComponent.Economy>().log.add(
                WorldObjectComponent.Economy.Log(
                    logType = "imported_resources",
                    entryName = "",
                    resourceType = currentImport.type,
                    amount = currentImport.amount
                )
            )
            matchingExport.worldObject.getComponent<WorldObjectComponent.Economy>().log.add(
                WorldObjectComponent.Economy.Log(
                    logType = "exported_resources",
                    entryName = "",
                    resourceType = currentImport.type,
                    amount = currentImport.amount
                )
            )
            log().debug { "     ... traded $tradeAmount ${currentImport.type}: ${currentImport.worldObject.type.group}/${currentImport.worldObject.type.name} -> ${matchingExport.worldObject.type.group}/${matchingExport.worldObject.type.name}" }

            // parts of import offer remaining -> put back partial import offer
            if (remainingImportAmount > 0.0001) {
                openImportOffers.add(0, TradeOffer.Import(currentImport.worldObject, currentImport.type, remainingImportAmount))
                log().debug { "     ... ${currentImport.worldObject.type.group}/${currentImport.worldObject.type.name} remaining import offer $remainingImportAmount ${currentImport.type}" }
            }

            // parts of export offer remaining -> put back partial export offer
            if (remainingExportAmount > 0.0001) {
                openExportOffers.add(0, TradeOffer.Export(matchingExport.worldObject, matchingExport.type, remainingExportAmount))
                log().debug { "     ... ${matchingExport.worldObject.type.group}/${matchingExport.worldObject.type.name} remaining export offer $remainingExportAmount ${currentImport.type}" }
            }

        }

    }

    private fun limitResourceStorage(gameState: GameState) {
        log().debug { "... limiting stockpiles" }

        // for each world object
        gameState.worldObjects
            .filter { it.hasComponent<WorldObjectComponent.Economy>() }
            .forEach { worldObject ->
                val economyComponent = worldObject.getComponent<WorldObjectComponent.Economy>()

                // for each resource type
                ResourceType.entries.forEach { resourceType ->

                    // calculate target stockpile it wants to keep
                    val totalDemand = economyComponent.entries.sumOf { it.consumes.getOrDefault(resourceType, 0.0) }
                    val targetStockpile = totalDemand + 0.0

                    // limit to max stockpile
                    val maxStockpile = max(10.0, targetStockpile * 3.0)
                    if (maxStockpile < economyComponent.storage.getAmount(resourceType)) {
                        log().debug {
                            "     ... ${worldObject.type.group}/${worldObject.type.name} limiting $resourceType stockpile (${
                                economyComponent.storage.getAmount(
                                    resourceType
                                )
                            }) to $maxStockpile"
                        }
                        economyComponent.storage.set(resourceType, maxStockpile)
                    }
                }

            }
    }

    private sealed class TradeOffer(val worldObject: WorldObject, val type: ResourceType, val amount: Double) {
        class Import(worldObject: WorldObject, type: ResourceType, amount: Double) : TradeOffer(worldObject, type, amount)
        class Export(worldObject: WorldObject, type: ResourceType, amount: Double) : TradeOffer(worldObject, type, amount)
    }

}

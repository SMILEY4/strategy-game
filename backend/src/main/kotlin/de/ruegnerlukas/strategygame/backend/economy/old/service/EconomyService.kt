package de.ruegnerlukas.strategygame.backend.economy.old.service

import de.ruegnerlukas.strategygame.backend.economy.old.data.EconomyNode

class EconomyService {

    private val consumptionNodeUpdateService = ConsumptionNodeUpdateService(ConsumptionEntityUpdateService())
    private val productionNodeUpdateService = ProductionNodeUpdateService(ProductionEntityUpdateService())

    fun update(root: EconomyNode) {
        consumptionNodeUpdateService.update(root)
        productionNodeUpdateService.update(root)
    }

}
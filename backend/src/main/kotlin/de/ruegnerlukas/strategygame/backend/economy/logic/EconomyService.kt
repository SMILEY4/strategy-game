package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyNode

class EconomyService {

    private val consumptionNodeUpdateService = ConsumptionNodeUpdateService(ConsumptionEntityUpdateService())
    private val productionNodeUpdateService = ProductionNodeUpdateService(ProductionEntityUpdateService())

    fun update(root: EconomyNode) {
        consumptionNodeUpdateService.update(root)
        productionNodeUpdateService.update(root)
    }

}
package de.ruegnerlukas.strategygame.backend.economy.core.service

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.economy.core.data.EconomyEntity

class ProductionEntityUpdateService: Logging {

    fun update(entity: EconomyEntity) {
        entity.getNode().getStorage().add(entity.getOutput())
        entity.flagOutputDone()
        log().debug("[eco-update] $entity produced ${entity.getOutput().toList()}")
    }

}
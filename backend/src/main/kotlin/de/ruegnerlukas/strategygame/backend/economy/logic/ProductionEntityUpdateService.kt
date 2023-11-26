package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity

class ProductionEntityUpdateService: Logging {

    fun update(entity: EconomyEntity) {
        entity.getOwner().getStorage().add(entity.getConfig().output)
        entity.getState().produce()
        log().debug("[eco-update] $entity produced ${entity.getConfig().output.toList()}")
    }

}
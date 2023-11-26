package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity

class ProductionEntityUpdateService: Logging {

    fun update(entity: EconomyEntity) {
        entity.owner.storage.add(entity.config.output)
        entity.state.produce()
        log().debug("[eco-update] $entity produced ${entity.config.output.toList()}")
    }

}
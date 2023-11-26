package de.ruegnerlukas.strategygame.backend.economy.logic

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.report.EconomyUpdateReport

class ProductionEntityUpdateService : Logging {

    fun update(entity: EconomyEntity, report: EconomyUpdateReport) {
        entity.owner.storage.add(entity.config.output)
        entity.state.produce()
        report.addProduction(
            entity = entity,
            inNode = entity.owner,
            resources = entity.config.output
        )
        log().debug("[eco-update] $entity produced ${entity.config.output.toList()}")
    }

}
package io.github.smiley4.strategygame.backend.ecosim.module.logic

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.ecosim.module.data.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.module.report.EconomyReport


internal class ProductionEntityUpdateService : Logging {

    fun update(entity: EconomyEntity, report: EconomyReport) {
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
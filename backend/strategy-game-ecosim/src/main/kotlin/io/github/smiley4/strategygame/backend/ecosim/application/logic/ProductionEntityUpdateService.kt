package io.github.smiley4.strategygame.backend.ecosim.application.logic

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport


internal class ProductionEntityUpdateService : Logging {

    fun update(entity: EconomyEntity, report: EconomyReport) {
        entity.owner.storage.add(entity.config.output)
        entity.state.produce(entity.config.output)
        report.addProduction(
            entity = entity,
            inNode = entity.owner,
            resources = entity.config.output
        )
        log().debug("$entity produced ${entity.config.output.toList()}")
    }

}
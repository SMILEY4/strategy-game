package io.github.smiley4.strategygame.backend.engine.application.core.process.steps

import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyUpdateState
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.PopulationBaseEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.PopulationGrowthEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.SettlementEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.EconomyUpdatedEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessStep

class PopulationStep : ProcessStep<EconomyUpdatedEvent> {

    override suspend fun run(event: EconomyUpdatedEvent) {
        event.game.settlements.forEach { update(event.report, it) }
    }

    private fun update(report: EconomyReport, settlement: Settlement) {

        if(settlement.population.growthProgress >= 1f) {
            settlement.population.size += 1
            settlement.population.growthProgress = 0f
        }

        if(settlement.population.growthProgress <= -1f) {
            settlement.population.size -= 1
            settlement.population.growthProgress = 0f
        }

        settlement.population.growthDetails.clear()

        settlement.population.growthProgress +=
            if (hasConsumedBase(report, settlement)) {
                settlement.population.growthDetails["base"] = 0.05f
                0.05f
            }
            else {
                settlement.population.growthDetails["base"] = -0.2f
                -0.2f
            }

        settlement.population.growthProgress +=
            if (hasConsumedGrowth(report, settlement)) {
                settlement.population.growthDetails["growth"] = 0.15f
                0.15f
            }
            else {
                0f
            }
    }

    private fun hasConsumedBase(report: EconomyReport, settlement: Settlement): Boolean {
        val entity = findPopulationBaseEconomyEntity(report, settlement)
        return if (entity != null) {
            entity.state.state == EconomyUpdateState.DONE
        } else {
            false
        }
    }

    private fun hasConsumedGrowth(report: EconomyReport, settlement: Settlement): Boolean {
        val entity = findPopulationGrowthEconomyEntity(report, settlement)
        return if (entity != null) {
            entity.state.state == EconomyUpdateState.DONE
        } else {
            false
        }
    }

    private fun findPopulationBaseEconomyEntity(report: EconomyReport, settlement: Settlement): PopulationBaseEconomyEntity? {
        return report.getEntries()
            .filterIsInstance<PopulationBaseEconomyEntity>()
            .find { it.isOwnedBy(settlement) }
    }

    private fun findPopulationGrowthEconomyEntity(report: EconomyReport, settlement: Settlement): PopulationGrowthEconomyEntity? {
        return report.getEntries()
            .filterIsInstance<PopulationGrowthEconomyEntity>()
            .find { it.isOwnedBy(settlement) }
    }

    private fun EconomyEntity.isOwnedBy(settlement: Settlement): Boolean {
        if (this.owner is SettlementEconomyNode) {
            return (this.owner as SettlementEconomyNode).settlement.id == settlement.id
        }
        return false
    }

}
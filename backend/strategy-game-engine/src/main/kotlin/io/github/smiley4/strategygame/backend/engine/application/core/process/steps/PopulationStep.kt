package io.github.smiley4.strategygame.backend.engine.application.core.process.steps

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.ecosim.lib.ConsumptionReportEntry
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.PopulationBaseEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.PopulationGrowthEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.SettlementEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.EconomyUpdatedEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessStep

class PopulationStep : ProcessStep<EconomyUpdatedEvent> {

    override suspend fun run(event: EconomyUpdatedEvent) {
        val toAbandon = mutableListOf<Settlement>()
        event.game.settlements.forEach { settlement ->
            updateSize(settlement)
            updateProgress(event.report, settlement)
            if (settlement.population.size <= 0) {
                toAbandon.add(settlement)
            }
        }
        toAbandon.forEach { abandon(event.game, it) }
    }

    private fun updateSize(settlement: Settlement) {
        if (settlement.population.growthProgress >= 1f) {
            settlement.population.size += 1
            settlement.population.growthProgress = 0f
        }
        if (settlement.population.growthProgress <= -1f) {
            settlement.population.size -= 1
            settlement.population.growthProgress = 0f
        }
    }

    private fun updateProgress(report: EconomyReport, settlement: Settlement) {

        settlement.population.growthDetails.clear()
        if (hasConsumedBase(report, settlement)) {
            settlement.population.growthDetails["base"] = 0.05f
        } else {
            settlement.population.growthDetails["base"] = -0.2f
        }
        if (hasConsumedGrowth(report, settlement)) {
            settlement.population.growthDetails["growth"] = 0.15f
        }

        val amount = settlement.population.growthDetails.map { it.value }.sum()
        settlement.population.growthAmount = amount
        settlement.population.growthProgress += amount
    }

    private fun abandon(game: GameExtended, settlement: Settlement) {
        game.settlements.remove(settlement)
        game.routes.removeIf { it.settlementA == settlement.id || it.settlementB == settlement.id }
    }

    private fun hasConsumedBase(report: EconomyReport, settlement: Settlement): Boolean {
        return findBaseConsumptionEntry(report, settlement) != null
    }

    private fun hasConsumedGrowth(report: EconomyReport, settlement: Settlement): Boolean {
        return findGrowthConsumptionEntry(report, settlement) != null
    }

    private fun findBaseConsumptionEntry(report: EconomyReport, settlement: Settlement): ConsumptionReportEntry? {
        return report.getEntries()
            .filterIsInstance<ConsumptionReportEntry>()
            .filter { it.entity is PopulationBaseEconomyEntity }
            .find { (it.entity as PopulationBaseEconomyEntity).isOwnedBy(settlement) }
    }

    private fun findGrowthConsumptionEntry(report: EconomyReport, settlement: Settlement): ConsumptionReportEntry? {
        return report.getEntries()
            .filterIsInstance<ConsumptionReportEntry>()
            .filter { it.entity is PopulationGrowthEconomyEntity }
            .find { (it.entity as PopulationGrowthEconomyEntity).isOwnedBy(settlement) }
    }

    private fun EconomyEntity.isOwnedBy(settlement: Settlement): Boolean {
        if (this.owner is SettlementEconomyNode) {
            return (this.owner as SettlementEconomyNode).settlement.id == settlement.id
        }
        return false
    }

}
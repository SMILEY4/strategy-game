package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.ledger.ResourceLedgerDetail
import de.ruegnerlukas.strategygame.backend.economy.ledger.ResourceLedgerDetailBuilder
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationBaseEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationGrowthEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.ProductionQueueEconomyEntity

class LedgerResourceDetailBuilderImpl : ResourceLedgerDetailBuilder {

    override fun consume(amount: Float, entity: EconomyEntity): ResourceLedgerDetail {
        return when (entity) {
            is BuildingEconomyEntity -> BuildingConsumptionDetail(entity.building.type, amount)
            is PopulationBaseEconomyEntity -> PopulationBaseDetail(amount)
            is PopulationGrowthEconomyEntity -> PopulationGrowthDetail(amount)
            is ProductionQueueEconomyEntity -> ProductionQueueDetail(amount)
            else -> UnknownConsumptionLedgerDetail(amount)
        }
    }

    override fun produce(amount: Float, entity: EconomyEntity): ResourceLedgerDetail {
        return when (entity) {
            is BuildingEconomyEntity -> BuildingProductionDetail(entity.building.type, amount)
            else -> UnknownProductionLedgerDetail(amount)
        }
    }

    override fun giveShare(amount: Float, entity: EconomyEntity): ResourceLedgerDetail {
        return GiveSharedResourceDetail(amount)
    }

    override fun takeShare(amount: Float, entity: EconomyEntity): ResourceLedgerDetail {
        return TakeSharedResourceDetail(amount)
    }

    override fun missing(amount: Float, entity: EconomyEntity): ResourceLedgerDetail {
        return when (entity) {
            is BuildingEconomyEntity -> BuildingMissingDetail(entity.building.type, amount)
            is PopulationBaseEconomyEntity -> PopulationBaseMissingDetail(amount)
            is PopulationGrowthEconomyEntity -> PopulationGrowthMissingDetail(amount)
            is ProductionQueueEconomyEntity -> ProductionQueueMissingDetail(amount)
            else -> UnknownMissingLedgerDetail(amount)
        }
    }

}
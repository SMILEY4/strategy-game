package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.economy.ledger.LedgerResourceDetail
import de.ruegnerlukas.strategygame.backend.economy.ledger.LedgerResourceDetailBuilder
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.BuildingEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationBaseEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.PopulationGrowthEconomyEntity
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.entity.ProductionQueueEconomyEntity

class LedgerResourceDetailBuilderImpl : LedgerResourceDetailBuilder {

    override fun consume(amount: Float, entity: EconomyEntity): LedgerResourceDetail {
        return when (entity) {
            is BuildingEconomyEntity -> BuildingConsumptionDetail(amount, entity.building.type)
            is PopulationBaseEconomyEntity -> PopulationBaseDetail(amount)
            is PopulationGrowthEconomyEntity -> PopulationGrowthDetail(amount)
            is ProductionQueueEconomyEntity -> ProductionQueueDetail(amount)
            else -> UnknownConsumptionLedgerDetail(amount)
        }
    }

    override fun produce(amount: Float, entity: EconomyEntity): LedgerResourceDetail {
        return when (entity) {
            is BuildingEconomyEntity -> BuildingProductionDetail(amount, entity.building.type)
            else -> UnknownProductionLedgerDetail(amount)
        }
    }

    override fun giveShare(amount: Float, entity: EconomyEntity): LedgerResourceDetail {
        return GiveSharedResourceDetail(amount)
    }

    override fun takeShare(amount: Float, entity: EconomyEntity): LedgerResourceDetail {
        return TakeSharedResourceDetail(amount)
    }

    override fun missing(amount: Float, entity: EconomyEntity): LedgerResourceDetail {
        return when (entity) {
            is BuildingEconomyEntity -> BuildingMissingDetail(amount, entity.building.type)
            is PopulationBaseEconomyEntity -> PopulationBaseMissingDetail(amount)
            is PopulationGrowthEconomyEntity -> PopulationGrowthMissingDetail(amount)
            is ProductionQueueEconomyEntity -> ProductionQueueMissingDetail(amount)
            else -> UnknownMissingLedgerDetail(amount)
        }
    }

}
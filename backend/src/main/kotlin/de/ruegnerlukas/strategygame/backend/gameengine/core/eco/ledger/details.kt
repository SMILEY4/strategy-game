package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger

import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.economy.ledger.LedgerResourceDetail
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry


class UnknownConsumptionLedgerDetail(
    var amount: Float
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is UnknownConsumptionLedgerDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class UnknownProductionLedgerDetail(
    var amount: Float
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is UnknownProductionLedgerDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class UnknownMissingLedgerDetail(
    var amount: Float
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is UnknownMissingLedgerDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class PopulationBaseDetail(
    var amount: Float
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is PopulationBaseDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class PopulationGrowthDetail(
    var amount: Float
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is PopulationGrowthDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class PopulationBaseMissingDetail(
    var amount: Float
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is PopulationBaseMissingDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class PopulationGrowthMissingDetail(
    var amount: Float
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is PopulationGrowthMissingDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class BuildingConsumptionDetail(
    var amount: Float,
    val buildingType: BuildingType
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is BuildingConsumptionDetail && other.buildingType == buildingType) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class BuildingProductionDetail(
    var amount: Float,
    val buildingType: BuildingType
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is BuildingProductionDetail && other.buildingType == buildingType) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class BuildingMissingDetail(
    var amount: Float,
    val buildingType: BuildingType
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is BuildingMissingDetail && other.buildingType == buildingType) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class ProductionQueueDetail(
    var amount: Float,
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is ProductionQueueDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class ProductionQueueMissingDetail(
    var amount: Float,
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is ProductionQueueMissingDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class GiveSharedResourceDetail(
    var amount: Float
) : LedgerResourceDetail {

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is GiveSharedResourceDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}


class TakeSharedResourceDetail(
    var amount: Float
) : LedgerResourceDetail{

    override fun merge(other: LedgerResourceDetail): Boolean {
        return if(other is TakeSharedResourceDetail) {
            this.amount += other.amount
            true
        } else {
            false
        }
    }

}

package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.economy.ledger.LedgerResourceDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.BuildingConsumptionDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.BuildingMissingDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.BuildingProductionDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.GiveSharedResourceDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.PopulationBaseDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.PopulationBaseMissingDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.PopulationGrowthDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.PopulationGrowthMissingDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ProductionQueueDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ProductionQueueMissingDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ProductionQueueRefundDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.TakeSharedResourceDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.UnknownConsumptionLedgerDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.UnknownMissingLedgerDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.UnknownProductionLedgerDetail

@JsonTypeInfo(
    use = JsonTypeInfo.Id.MINIMAL_CLASS,
    include = JsonTypeInfo.As.PROPERTY,
    property = "sub_type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = UnknownConsumptionLedgerDetailEntity::class),
    JsonSubTypes.Type(value = UnknownProductionLedgerDetailEntity::class),
    JsonSubTypes.Type(value = UnknownMissingLedgerDetailEntity::class),
    JsonSubTypes.Type(value = PopulationBaseDetailEntity::class),
    JsonSubTypes.Type(value = PopulationGrowthDetailEntity::class),
    JsonSubTypes.Type(value = PopulationBaseMissingDetailEntity::class),
    JsonSubTypes.Type(value = PopulationGrowthMissingDetailEntity::class),
    JsonSubTypes.Type(value = BuildingConsumptionDetailEntity::class),
    JsonSubTypes.Type(value = BuildingProductionDetailEntity::class),
    JsonSubTypes.Type(value = BuildingMissingDetailEntity::class),
    JsonSubTypes.Type(value = ProductionQueueDetailEntity::class),
    JsonSubTypes.Type(value = ProductionQueueMissingDetailEntity::class),
    JsonSubTypes.Type(value = ProductionQueueRefundDetailEntity::class),
    JsonSubTypes.Type(value = GiveSharedResourceDetailEntity::class),
    JsonSubTypes.Type(value = TakeSharedResourceDetailEntity::class),
)
sealed interface LedgerDetailEntity {

    companion object {

        fun of(serviceModel: LedgerResourceDetail): LedgerDetailEntity {
            return when(serviceModel) {
                is UnknownConsumptionLedgerDetail -> UnknownConsumptionLedgerDetailEntity(serviceModel.amount)
                is UnknownProductionLedgerDetail -> UnknownProductionLedgerDetailEntity(serviceModel.amount)
                is UnknownMissingLedgerDetail -> UnknownMissingLedgerDetailEntity(serviceModel.amount)
                is PopulationBaseDetail -> PopulationBaseDetailEntity(serviceModel.amount)
                is PopulationGrowthDetail -> PopulationGrowthDetailEntity(serviceModel.amount)
                is PopulationBaseMissingDetail -> PopulationBaseMissingDetailEntity(serviceModel.amount)
                is PopulationGrowthMissingDetail -> PopulationGrowthMissingDetailEntity(serviceModel.amount)
                is BuildingConsumptionDetail -> BuildingConsumptionDetailEntity(serviceModel.buildingType, serviceModel.amount, serviceModel.count)
                is BuildingProductionDetail -> BuildingProductionDetailEntity(serviceModel.buildingType, serviceModel.amount, serviceModel.count)
                is BuildingMissingDetail -> BuildingMissingDetailEntity(serviceModel.buildingType, serviceModel.amount, serviceModel.count)
                is ProductionQueueDetail -> ProductionQueueDetailEntity(serviceModel.amount, serviceModel.count)
                is ProductionQueueMissingDetail -> ProductionQueueMissingDetailEntity(serviceModel.amount, serviceModel.count)
                is ProductionQueueRefundDetail -> ProductionQueueRefundDetailEntity(serviceModel.amount, serviceModel.count)
                is GiveSharedResourceDetail -> GiveSharedResourceDetailEntity(serviceModel.amount)
                is TakeSharedResourceDetail -> TakeSharedResourceDetailEntity(serviceModel.amount)
                else -> throw Exception("Unexpected LedgerResourceDetail-type")
            }
        }

        fun LedgerDetailEntity.asServiceModel(): LedgerResourceDetail {
            return when(this) {
                is UnknownConsumptionLedgerDetailEntity -> UnknownConsumptionLedgerDetail(this.amount)
                is UnknownProductionLedgerDetailEntity -> UnknownProductionLedgerDetail(this.amount)
                is UnknownMissingLedgerDetailEntity -> UnknownMissingLedgerDetail(this.amount)
                is PopulationBaseDetailEntity -> PopulationBaseDetail(this.amount)
                is PopulationGrowthDetailEntity -> PopulationGrowthDetail(this.amount)
                is PopulationBaseMissingDetailEntity -> PopulationBaseMissingDetail(this.amount)
                is PopulationGrowthMissingDetailEntity -> PopulationGrowthMissingDetail(this.amount)
                is BuildingConsumptionDetailEntity -> BuildingConsumptionDetail(this.buildingType, this.amount)
                is BuildingProductionDetailEntity -> BuildingProductionDetail(this.buildingType, this.amount, this.count)
                is BuildingMissingDetailEntity -> BuildingMissingDetail(this.buildingType, this.amount, this.count)
                is ProductionQueueDetailEntity -> ProductionQueueDetail(this.amount)
                is ProductionQueueMissingDetailEntity -> ProductionQueueMissingDetail(this.amount)
                is ProductionQueueRefundDetailEntity -> ProductionQueueRefundDetail(this.amount)
                is GiveSharedResourceDetailEntity -> GiveSharedResourceDetail(this.amount)
                is TakeSharedResourceDetailEntity -> TakeSharedResourceDetail(this.amount)
            }
        }

    }

}

data class UnknownConsumptionLedgerDetailEntity(
    val amount: Float
) : LedgerDetailEntity

data class UnknownProductionLedgerDetailEntity(
    val amount: Float
) : LedgerDetailEntity

data class UnknownMissingLedgerDetailEntity(
    val amount: Float
) : LedgerDetailEntity

data class PopulationBaseDetailEntity(
    val amount: Float
) : LedgerDetailEntity

data class PopulationGrowthDetailEntity(
    val amount: Float
) : LedgerDetailEntity

data class PopulationBaseMissingDetailEntity(
    val amount: Float
) : LedgerDetailEntity

data class PopulationGrowthMissingDetailEntity(
    val amount: Float
) : LedgerDetailEntity

data class BuildingConsumptionDetailEntity(
    val buildingType: BuildingType,
    val amount: Float,
    val count: Int
) : LedgerDetailEntity

data class BuildingProductionDetailEntity(
    val buildingType: BuildingType,
    val amount: Float,
    val count: Int
) : LedgerDetailEntity

data class BuildingMissingDetailEntity(
    val buildingType: BuildingType,
    val amount: Float,
    val count: Int
) : LedgerDetailEntity

data class ProductionQueueDetailEntity(
    val amount: Float,
    val count: Int
) : LedgerDetailEntity

data class ProductionQueueMissingDetailEntity(
    val amount: Float,
    val count: Int
) : LedgerDetailEntity

data class ProductionQueueRefundDetailEntity(
    val amount: Float,
    val count: Int
) : LedgerDetailEntity

data class GiveSharedResourceDetailEntity(
    val amount: Float
) : LedgerDetailEntity

data class TakeSharedResourceDetailEntity(
    val amount: Float
) : LedgerDetailEntity
package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.BuildingConsumptionDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.BuildingMissingDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.BuildingProductionDetail
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.GameResourceLedgerDetail
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

data class ResourceLedgerDTO(
    val entries: List<ResourceLedgerEntryDTO>
)

data class ResourceLedgerEntryDTO(
    val resourceType: ResourceType,
    val amount: Float,
    val missing: Float,
    val details: List<ResourceLedgerDetailDTO>
)


@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = UnknownConsumptionLedgerDetailDTO::class),
    JsonSubTypes.Type(value = UnknownProductionLedgerDetailDTO::class),
    JsonSubTypes.Type(value = UnknownMissingLedgerDetailDTO::class),
    JsonSubTypes.Type(value = PopulationBaseDetailDTO::class),
    JsonSubTypes.Type(value = PopulationGrowthDetailDTO::class),
    JsonSubTypes.Type(value = PopulationBaseMissingDetailDTO::class),
    JsonSubTypes.Type(value = PopulationGrowthMissingDetailDTO::class),
    JsonSubTypes.Type(value = BuildingConsumptionDetailDTO::class),
    JsonSubTypes.Type(value = BuildingProductionDetailDTO::class),
    JsonSubTypes.Type(value = BuildingMissingDetailDTO::class),
    JsonSubTypes.Type(value = ProductionQueueDetailDTO::class),
    JsonSubTypes.Type(value = ProductionQueueMissingDetailDTO::class),
    JsonSubTypes.Type(value = ProductionQueueRefundDetailDTO::class),
    JsonSubTypes.Type(value = GiveSharedResourceDetailDTO::class),
    JsonSubTypes.Type(value = TakeSharedResourceDetailDTO::class),
)
sealed class ResourceLedgerDetailDTO(val type: String) {

    companion object {

        fun of(serviceModel: GameResourceLedgerDetail): ResourceLedgerDetailDTO {
            return when (serviceModel) {
                is UnknownConsumptionLedgerDetail -> UnknownConsumptionLedgerDetailDTO(serviceModel.amount)
                is UnknownProductionLedgerDetail -> UnknownProductionLedgerDetailDTO(serviceModel.amount)
                is UnknownMissingLedgerDetail -> UnknownMissingLedgerDetailDTO(serviceModel.amount)
                is PopulationBaseDetail -> PopulationBaseDetailDTO(serviceModel.amount)
                is PopulationGrowthDetail -> PopulationGrowthDetailDTO(serviceModel.amount)
                is PopulationBaseMissingDetail -> PopulationBaseMissingDetailDTO(serviceModel.amount)
                is PopulationGrowthMissingDetail -> PopulationGrowthMissingDetailDTO(serviceModel.amount)
                is BuildingConsumptionDetail -> BuildingConsumptionDetailDTO(
                    serviceModel.buildingType,
                    serviceModel.amount,
                    serviceModel.count
                )
                is BuildingProductionDetail -> BuildingProductionDetailDTO(
                    serviceModel.buildingType,
                    serviceModel.amount,
                    serviceModel.count
                )
                is BuildingMissingDetail -> BuildingMissingDetailDTO(serviceModel.buildingType, serviceModel.amount, serviceModel.count)
                is ProductionQueueDetail -> ProductionQueueDetailDTO(serviceModel.amount, serviceModel.count)
                is ProductionQueueMissingDetail -> ProductionQueueMissingDetailDTO(serviceModel.amount, serviceModel.count)
                is ProductionQueueRefundDetail -> ProductionQueueRefundDetailDTO(serviceModel.amount, serviceModel.count)
                is GiveSharedResourceDetail -> GiveSharedResourceDetailDTO(serviceModel.amount)
                is TakeSharedResourceDetail -> TakeSharedResourceDetailDTO(serviceModel.amount)
            }
        }

    }

}

@JsonTypeName(UnknownConsumptionLedgerDetailDTO.TYPE)
data class UnknownConsumptionLedgerDetailDTO(
    val amount: Float
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "unknown-consumption"
    }
}

@JsonTypeName(UnknownProductionLedgerDetailDTO.TYPE)
data class UnknownProductionLedgerDetailDTO(
    val amount: Float
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "unknown-production"
    }
}

@JsonTypeName(UnknownMissingLedgerDetailDTO.TYPE)
data class UnknownMissingLedgerDetailDTO(
    val amount: Float
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "unknown-missing"
    }
}

@JsonTypeName(PopulationBaseDetailDTO.TYPE)
data class PopulationBaseDetailDTO(
    val amount: Float
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "population-base"
    }
}

@JsonTypeName(PopulationGrowthDetailDTO.TYPE)
data class PopulationGrowthDetailDTO(
    val amount: Float
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "population-growth"
    }
}

@JsonTypeName(PopulationBaseMissingDetailDTO.TYPE)
data class PopulationBaseMissingDetailDTO(
    val amount: Float
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "population-base-missing"
    }
}

@JsonTypeName(PopulationGrowthMissingDetailDTO.TYPE)
data class PopulationGrowthMissingDetailDTO(
    val amount: Float
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "population-growth-missing"
    }
}

@JsonTypeName(BuildingConsumptionDetailDTO.TYPE)
data class BuildingConsumptionDetailDTO(
    val buildingType: BuildingType,
    val amount: Float,
    val count: Int
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "building-consumption"
    }
}

@JsonTypeName(BuildingProductionDetailDTO.TYPE)
data class BuildingProductionDetailDTO(
    val buildingType: BuildingType,
    val amount: Float,
    val count: Int
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "building-production"
    }
}

@JsonTypeName(BuildingMissingDetailDTO.TYPE)
data class BuildingMissingDetailDTO(
    val buildingType: BuildingType,
    val amount: Float,
    val count: Int
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "building-missing"
    }
}

@JsonTypeName(ProductionQueueDetailDTO.TYPE)
data class ProductionQueueDetailDTO(
    val amount: Float,
    val count: Int
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "production-queue"
    }
}

@JsonTypeName(ProductionQueueMissingDetailDTO.TYPE)
data class ProductionQueueMissingDetailDTO(
    val amount: Float,
    val count: Int
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-missing"
    }
}

@JsonTypeName(ProductionQueueRefundDetailDTO.TYPE)
data class ProductionQueueRefundDetailDTO(
    val amount: Float,
    val count: Int
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-refund"
    }
}

@JsonTypeName(GiveSharedResourceDetailDTO.TYPE)
data class GiveSharedResourceDetailDTO(
    val amount: Float
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "give-shared"
    }
}

@JsonTypeName(TakeSharedResourceDetailDTO.TYPE)
data class TakeSharedResourceDetailDTO(
    val amount: Float
) : ResourceLedgerDetailDTO(TYPE) {
    companion object {
        internal const val TYPE = "take-shared"
    }
}
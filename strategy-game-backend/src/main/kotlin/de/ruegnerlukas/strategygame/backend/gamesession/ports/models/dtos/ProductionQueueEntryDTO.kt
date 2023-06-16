package de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = ProductionQueueBuildingEntryDTO::class),
    JsonSubTypes.Type(value = ProductionQueueSettlerEntryDTO::class),
)
sealed class ProductionQueueEntryDTO(
    val type: String,
    val entryId: String,
    val progress: Float
)


@JsonTypeName(ProductionQueueBuildingEntryDTO.TYPE)
class ProductionQueueBuildingEntryDTO(
    entryId: String,
    progress: Float,
    val buildingType: BuildingType,
) : ProductionQueueEntryDTO(TYPE, entryId, progress) {
    companion object {
        internal const val TYPE = "building"
    }
}


@JsonTypeName(ProductionQueueSettlerEntryDTO.TYPE)
class ProductionQueueSettlerEntryDTO(
    entryId: String,
    progress: Float,
) : ProductionQueueEntryDTO(TYPE, entryId, progress) {
    companion object {
        internal const val TYPE = "settler"
    }
}
package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commonarangodb.DbId
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.CreateCityCommandData
import io.github.smiley4.strategygame.backend.commondata.DeleteMarkerCommandData
import io.github.smiley4.strategygame.backend.commondata.PlaceMarkerCommandData
import io.github.smiley4.strategygame.backend.commondata.PlaceScoutCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddBuildingEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddSettlerEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueRemoveEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.UpgradeSettlementTierCommandData

internal class CommandEntity<T : CommandEntityData>(
    val userId: String,
    val gameId: String,
    val turn: Int,
    val data: T,
    key: String? = null,
) : DbEntity(key) {

    companion object {

        fun of(serviceModel: Command<*>) = CommandEntity(
            key = DbId.asDbId(serviceModel.commandId),
            userId = serviceModel.userId,
            gameId = serviceModel.gameId,
            turn = serviceModel.turn,
            data = of(serviceModel.data)
        )

        private fun of(serviceModel: CommandData): CommandEntityData {
            return when (serviceModel) {
                is CreateCityCommandData -> CreateCityCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
                    name = serviceModel.name,
                    withNewProvince = serviceModel.withNewProvince
                )
                is UpgradeSettlementTierCommandData -> UpgradeSettlementTierCommandEntityData(
                    cityId = serviceModel.cityId,
                )
                is PlaceMarkerCommandData -> PlaceMarkerCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
                    label = serviceModel.label
                )
                is DeleteMarkerCommandData -> DeleteMarkerCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
                )
                is PlaceScoutCommandData -> PlaceScoutCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
                )
                is ProductionQueueAddBuildingEntryCommandData -> ProductionQueueAddBuildingEntryCommandEntityData(
                    cityId = serviceModel.cityId,
                    buildingType = serviceModel.buildingType
                )
                is ProductionQueueAddSettlerEntryCommandData -> ProductionQueueAddSettlerEntryCommandEntityData(
                    cityId = serviceModel.cityId,
                )
                is ProductionQueueRemoveEntryCommandData -> ProductionQueueRemoveEntryCommandEntityData(
                    cityId = serviceModel.cityId,
                    queueEntryId = serviceModel.queueEntryId
                )
            }
        }

    }

    fun asServiceModel() = Command(
        commandId = this.getKeyOrThrow(),
        userId = this.userId,
        gameId = this.gameId,
        turn = this.turn,
        data = asServiceModel(this.data)
    )

    private fun asServiceModel(entity: CommandEntityData): CommandData {
        return when (entity) {
            is CreateCityCommandEntityData -> CreateCityCommandData(
                q = entity.q,
                r = entity.r,
                name = entity.name,
                withNewProvince = entity.withNewProvince
            )
            is UpgradeSettlementTierCommandEntityData -> UpgradeSettlementTierCommandData(
                cityId = entity.cityId
            )
            is PlaceMarkerCommandEntityData -> PlaceMarkerCommandData(
                q = entity.q,
                r = entity.r,
                label = entity.label
            )
            is DeleteMarkerCommandEntityData -> DeleteMarkerCommandData(
                q = entity.q,
                r = entity.r,
            )
            is PlaceScoutCommandEntityData -> PlaceScoutCommandData(
                q = entity.q,
                r = entity.r,
            )
            is ProductionQueueAddBuildingEntryCommandEntityData -> ProductionQueueAddBuildingEntryCommandData(
                cityId = entity.cityId,
                buildingType = entity.buildingType
            )
            is ProductionQueueAddSettlerEntryCommandEntityData -> ProductionQueueAddSettlerEntryCommandData(
                cityId = entity.cityId,
            )
            is ProductionQueueRemoveEntryCommandEntityData -> ProductionQueueRemoveEntryCommandData(
                cityId = entity.cityId,
                queueEntryId = entity.queueEntryId
            )
        }
    }

}


@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = CreateCityCommandEntityData::class),
    JsonSubTypes.Type(value = UpgradeSettlementTierCommandEntityData::class),
    JsonSubTypes.Type(value = PlaceMarkerCommandEntityData::class),
    JsonSubTypes.Type(value = PlaceScoutCommandEntityData::class),
    JsonSubTypes.Type(value = ProductionQueueAddBuildingEntryCommandEntityData::class),
    JsonSubTypes.Type(value = ProductionQueueAddSettlerEntryCommandEntityData::class),
    JsonSubTypes.Type(value = ProductionQueueRemoveEntryCommandEntityData::class),
)
internal sealed class CommandEntityData(
    val type: String
)


@JsonTypeName(CreateCityCommandEntityData.TYPE)
internal class CreateCityCommandEntityData(
    val q: Int,
    val r: Int,
    val name: String,
    val withNewProvince: Boolean,
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "create-city"
    }
}


@JsonTypeName(UpgradeSettlementTierCommandEntityData.TYPE)
internal class UpgradeSettlementTierCommandEntityData(
    val cityId: String,
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "upgrade-settlement-tier"
    }
}


@JsonTypeName(PlaceMarkerCommandEntityData.TYPE)
internal class PlaceMarkerCommandEntityData(
    val q: Int,
    val r: Int,
    val label: String,
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "place-marker"
    }
}

@JsonTypeName(DeleteMarkerCommandEntityData.TYPE)
internal class DeleteMarkerCommandEntityData(
    val q: Int,
    val r: Int
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "delete-marker"
    }
}


@JsonTypeName(PlaceScoutCommandEntityData.TYPE)
internal class PlaceScoutCommandEntityData(
    val q: Int,
    val r: Int
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "place-scout"
    }
}


@JsonTypeName(ProductionQueueAddBuildingEntryCommandEntityData.TYPE)
internal class ProductionQueueAddBuildingEntryCommandEntityData(
    val cityId: String,
    val buildingType: BuildingType
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-add-entry.building"
    }
}


@JsonTypeName(ProductionQueueAddSettlerEntryCommandEntityData.TYPE)
internal class ProductionQueueAddSettlerEntryCommandEntityData(
    val cityId: String,
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-add-entry.settler"
    }
}


@JsonTypeName(ProductionQueueRemoveEntryCommandEntityData.TYPE)
internal class ProductionQueueRemoveEntryCommandEntityData(
    val cityId: String,
    val queueEntryId: String
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-remove-entry"
    }
}
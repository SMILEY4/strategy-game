package io.github.smiley4.strategygame.backend.gateway.worlds.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.CreateCityCommandData
import io.github.smiley4.strategygame.backend.commondata.DeleteMarkerCommandData
import io.github.smiley4.strategygame.backend.commondata.PlaceMarkerCommandData
import io.github.smiley4.strategygame.backend.commondata.PlaceScoutCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddBuildingEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddSettlerEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueRemoveEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.UpgradeSettlementTierCommandData

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = PlaceMarkerCommandMsg::class),
    JsonSubTypes.Type(value = DeleteMarkerCommandMsg::class),
    JsonSubTypes.Type(value = CreateCityCommandMsg::class),
    JsonSubTypes.Type(value = UpgradeSettlementTierCommandMsg::class),
    JsonSubTypes.Type(value = PlaceScoutCommandMsg::class),
    JsonSubTypes.Type(value = ProductionQueueAddBuildingEntryCommandMsg::class),
    JsonSubTypes.Type(value = ProductionQueueAddSettlerEntryCommandMsg::class),
    JsonSubTypes.Type(value = ProductionQueueRemoveEntryCommandMsg::class),
)
internal sealed class PlayerCommandMsg(val type: String) {
    abstract fun asCommandData(): CommandData
}


@JsonTypeName(PlaceMarkerCommandMsg.TYPE)
internal class PlaceMarkerCommandMsg(
    val q: Int,
    val r: Int,
    val label: String
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "place-marker"
    }

    override fun asCommandData() = PlaceMarkerCommandData(
        q = this.q,
        r = this.r,
        label = this.label
    )
}


@JsonTypeName(DeleteMarkerCommandMsg.TYPE)
internal class DeleteMarkerCommandMsg(
    val q: Int,
    val r: Int,
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "delete-marker"
    }

    override fun asCommandData() = DeleteMarkerCommandData(
        q = this.q,
        r = this.r
    )
}

@JsonTypeName(CreateCityCommandMsg.TYPE)
internal class CreateCityCommandMsg(
    val q: Int,
    val r: Int,
    val name: String,
    val withNewProvince: Boolean
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "create-city"
    }

    override fun asCommandData() = CreateCityCommandData(
        q = this.q,
        r = this.r,
        name = this.name,
        withNewProvince = this.withNewProvince,
    )
}


@JsonTypeName(UpgradeSettlementTierCommandMsg.TYPE)
internal class UpgradeSettlementTierCommandMsg(
    val cityId: String
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "upgrade-settlement-tier"
    }

    override fun asCommandData() = UpgradeSettlementTierCommandData(
        cityId = this.cityId
    )
}


@JsonTypeName(PlaceScoutCommandMsg.TYPE)
internal class PlaceScoutCommandMsg(
    val q: Int,
    val r: Int,
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "place-scout"
    }

    override fun asCommandData() = PlaceScoutCommandData(
        q = this.q,
        r = this.r
    )
}


@JsonTypeName(ProductionQueueAddBuildingEntryCommandMsg.TYPE)
internal class ProductionQueueAddBuildingEntryCommandMsg(
    val cityId: String,
    val buildingType: BuildingType
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-add-entry.building"
    }

    override fun asCommandData() = ProductionQueueAddBuildingEntryCommandData(
        cityId = this.cityId,
        buildingType = this.buildingType
    )
}


@JsonTypeName(ProductionQueueAddSettlerEntryCommandMsg.TYPE)
internal class ProductionQueueAddSettlerEntryCommandMsg(
    val cityId: String,
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-add-entry.settler"
    }

    override fun asCommandData() = ProductionQueueAddSettlerEntryCommandData(
        cityId = this.cityId
    )
}


@JsonTypeName(ProductionQueueRemoveEntryCommandMsg.TYPE)
internal class ProductionQueueRemoveEntryCommandMsg(
    val cityId: String,
    val queueEntryId: String
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-remove-entry"
    }

    override fun asCommandData() = ProductionQueueRemoveEntryCommandData(
        cityId = this.cityId,
        queueEntryId = this.queueEntryId
    )
}
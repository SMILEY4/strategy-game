package io.github.smiley4.strategygame.backend.gateway.worlds.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementDirectCommandData
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementWithSettlerCommandData
import io.github.smiley4.strategygame.backend.commondata.MoveCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueRemoveEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.TileRef

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = MoveCommandMsg::class),
    JsonSubTypes.Type(value = CreateSettlementDirectCommandMsg::class),
    JsonSubTypes.Type(value = CreateSettlementWithSettlerCommandMsg::class),
    JsonSubTypes.Type(value = ProductionQueueRemoveEntryCommandMsg::class),
    JsonSubTypes.Type(value = ProductionQueueAddSettlerCommandMsg::class),
)
internal sealed class PlayerCommandMsg(val type: String) {
    abstract fun asCommandData(): CommandData
}


@JsonTypeName(MoveCommandMsg.TYPE)
internal class MoveCommandMsg(
    val worldObjectId: String,
    val path: List<TileRef>
) : PlayerCommandMsg(TYPE) {

    companion object {
        internal const val TYPE = "move"
    }

    override fun asCommandData() = MoveCommandData(
        worldObjectId = this.worldObjectId,
        path = this.path
    )
}


@JsonTypeName(CreateSettlementDirectCommandMsg.TYPE)
internal class CreateSettlementDirectCommandMsg(
    val name: String,
    val tile: TileRef
) : PlayerCommandMsg(TYPE) {

    companion object {
        internal const val TYPE = "create-settlement-direct"
    }

    override fun asCommandData() = CreateSettlementDirectCommandData(
        name = this.name,
        tile = this.tile
    )
}


@JsonTypeName(CreateSettlementWithSettlerCommandMsg.TYPE)
internal class CreateSettlementWithSettlerCommandMsg(
    val name: String,
    val worldObjectId: String
) : PlayerCommandMsg(TYPE) {

    companion object {
        internal const val TYPE = "create-settlement-settler"
    }

    override fun asCommandData() = CreateSettlementWithSettlerCommandData(
        name = this.name,
        worldObjectId = this.worldObjectId
    )
}


@JsonTypeName(ProductionQueueRemoveEntryCommandMsg.TYPE)
internal class ProductionQueueRemoveEntryCommandMsg(
    val entryId: String,
    val settlementId: String
) : PlayerCommandMsg(TYPE) {

    companion object {
        internal const val TYPE = "production-queue.remove-entry"
    }

    override fun asCommandData() = ProductionQueueRemoveEntryCommandData(
        entryId = this.entryId,
        settlementId = this.settlementId
    )
}


@JsonTypeName(ProductionQueueAddSettlerCommandMsg.TYPE)
internal class ProductionQueueAddSettlerCommandMsg(
    val settlementId: String,
) : PlayerCommandMsg(TYPE) {

    companion object {
        internal const val TYPE = "production-queue.add.settler"
    }

    override fun asCommandData() = ProductionQueueAddEntryCommandData.Settler(
        settlementId = this.settlementId
    )
}

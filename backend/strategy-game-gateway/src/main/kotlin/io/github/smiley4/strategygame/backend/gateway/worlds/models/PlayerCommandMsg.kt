package io.github.smiley4.strategygame.backend.gateway.worlds.models

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
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed class PlayerCommandMsg {
    abstract fun asCommandData(): CommandData
}


@JsonTypeName("move")
internal class MoveCommandMsg(
    val worldObjectId: String,
    val path: List<TileRef>
) : PlayerCommandMsg() {
    override fun asCommandData() = MoveCommandData(
        worldObjectId = this.worldObjectId,
        path = this.path
    )
}


@JsonTypeName("create-settlement-direct")
internal class CreateSettlementDirectCommandMsg(
    val name: String,
    val tile: TileRef
) : PlayerCommandMsg() {
    override fun asCommandData() = CreateSettlementDirectCommandData(
        name = this.name,
        tile = this.tile
    )
}


@JsonTypeName("create-settlement-settler")
internal class CreateSettlementWithSettlerCommandMsg(
    val name: String,
    val worldObjectId: String
) : PlayerCommandMsg() {
    override fun asCommandData() = CreateSettlementWithSettlerCommandData(
        name = this.name,
        worldObjectId = this.worldObjectId
    )
}


@JsonTypeName("production-queue.remove-entry")
internal class ProductionQueueRemoveEntryCommandMsg(
    val entryId: String,
    val settlementId: String
) : PlayerCommandMsg() {
    override fun asCommandData() = ProductionQueueRemoveEntryCommandData(
        entryId = this.entryId,
        settlementId = this.settlementId
    )
}


@JsonTypeName("production-queue.add.settler")
internal class ProductionQueueAddSettlerCommandMsg(
    val settlementId: String,
) : PlayerCommandMsg() {
    override fun asCommandData() = ProductionQueueAddEntryCommandData.Settler(
        settlementId = this.settlementId
    )
}

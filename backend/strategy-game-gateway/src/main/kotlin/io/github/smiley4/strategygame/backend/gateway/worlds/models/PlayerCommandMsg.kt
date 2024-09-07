package io.github.smiley4.strategygame.backend.gateway.worlds.models

import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.WorldObject

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
    override fun asCommandData() = CommandData.Move(
        worldObject = WorldObject.Id(worldObjectId),
        path = this.path
    )
}


@JsonTypeName("create-settlement-direct")
internal class CreateSettlementDirectCommandMsg(
    val name: String,
    val tile: TileRef
) : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.CreateSettlementDirect(
        name = this.name,
        tile = this.tile
    )
}


@JsonTypeName("create-settlement-settler")
internal class CreateSettlementWithSettlerCommandMsg(
    val name: String,
    val worldObjectId: String
) : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.CreateSettlementWithSettler(
        name = this.name,
        worldObject = WorldObject.Id(this.worldObjectId)
    )
}


@JsonTypeName("production-queue.remove-entry")
internal class ProductionQueueRemoveEntryCommandMsg(
    val entryId: String,
    val settlementId: String
) : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.ProductionQueueRemoveEntry(
        entry = ProductionQueueEntry.Id(this.entryId),
        settlement = Settlement.Id(this.settlementId)
    )
}


@JsonTypeName("production-queue.add.settler")
internal class ProductionQueueAddSettlerCommandMsg(
    val settlementId: String,
) : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.ProductionQueueAddEntry.Settler(
        settlement = Settlement.Id(this.settlementId)
    )
}

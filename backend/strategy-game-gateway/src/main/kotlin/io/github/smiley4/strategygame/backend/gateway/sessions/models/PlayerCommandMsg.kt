package io.github.smiley4.strategygame.backend.gateway.sessions.models

import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileImprovementType
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed class PlayerCommandMsg {
    abstract fun asCommandData(): CommandData
}


@JsonTypeName("world-object-move")
internal class MoveCommandMsg(
    val worldObjectId: String,
    val path: List<Tile.Ref>
) : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.Move(
        worldObject = WorldObject.Id(worldObjectId),
        path = this.path
    )
}


@JsonTypeName("world-object-disband")
internal class DisbandCommandMsg(
    val worldObjectId: String,
) : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.Disband(
        worldObject = WorldObject.Id(worldObjectId),
    )
}


@JsonTypeName("world-object-construct-improvement")
internal class ConstructTileImprovementCommandMsg(
    val worldObjectId: String,
    val improvementType: String
) : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.ConstructTileImprovement(
        worldObject = WorldObject.Id(worldObjectId),
        improvement = TileImprovementType.valueOf(improvementType),
    )
}


@JsonTypeName("world-object-spawn-settlement")
internal class SpawnSettlementCommandMsg(
    val worldObjectId: String,
    val tile: Tile.Ref,
    val settlementName: String
) : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.SpawnSettlement(
        worldObject = WorldObject.Id(worldObjectId),
        tile = tile,
        settlementName = settlementName,
    )
}


@JsonTypeName("world-object-add-production-queue-item")
internal class AddProductionQueueItemCommandMsg(
    val worldObjectId: String,
    val item: String
) : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.AddProductionQueueItem(
        worldObject = WorldObject.Id(worldObjectId),
        when (item) {
            "scout" -> WorldObjectComponent.Production.ProductionQueueEntry.Scout()
            "worker" -> WorldObjectComponent.Production.ProductionQueueEntry.Worker()
            else -> throw Exception("Invalid production queue item '$item'.")
        }
    )
}
package io.github.smiley4.strategygame.backend.gateway.sessions.models

import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.Tile
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
    val path: List<Tile.Ref>
) : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.Move(
        worldObject = WorldObject.Id(worldObjectId),
        path = this.path
    )
}
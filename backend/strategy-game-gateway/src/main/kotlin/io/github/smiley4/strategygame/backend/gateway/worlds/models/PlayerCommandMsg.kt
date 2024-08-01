package io.github.smiley4.strategygame.backend.gateway.worlds.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.MoveCommandData
import io.github.smiley4.strategygame.backend.commondata.TilePosition
import io.github.smiley4.strategygame.backend.commondata.TileRef

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = MoveCommandMsg::class),
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

package io.github.smiley4.strategygame.backend.gateway.sessions.models

import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commondata.CommandData

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed class PlayerCommandMsg {
    abstract fun asCommandData(): CommandData
}


@JsonTypeName("noop")
internal class NoOpCommandMsg() : PlayerCommandMsg() {
    override fun asCommandData() = CommandData.NoOp()
}

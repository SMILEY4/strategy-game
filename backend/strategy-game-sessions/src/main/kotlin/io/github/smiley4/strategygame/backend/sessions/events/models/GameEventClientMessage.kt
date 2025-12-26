@file:OptIn(ExperimentalSerializationApi::class)

package io.github.smiley4.strategygame.backend.sessions.events.models

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonClassDiscriminator

@Serializable
@JsonClassDiscriminator("messageType")
sealed class GameEventClientMessage {

    @Serializable
    @SerialName("submit")
    class Submit(
        val commands: List<CommandMessage>
    ) : GameEventClientMessage()

}
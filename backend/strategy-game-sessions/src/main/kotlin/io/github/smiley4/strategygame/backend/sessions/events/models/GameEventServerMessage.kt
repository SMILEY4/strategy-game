@file:OptIn(ExperimentalSerializationApi::class)

package io.github.smiley4.strategygame.backend.sessions.events.models

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonClassDiscriminator
import kotlinx.serialization.json.JsonElement

@Serializable
@JsonClassDiscriminator("messageType")
sealed class GameEventServerMessage {

    @Serializable
    @SerialName("game-state")
    class GameState(
        val state: JsonElement
    ) : GameEventServerMessage() {

        companion object {
            fun from(gameState: JsonType): GameState {
                return GameState(gameState.toKotlinx())
            }
        }

    }

}
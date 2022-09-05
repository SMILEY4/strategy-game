package de.ruegnerlukas.strategygame.backend.external.api.message.models

import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.external.api.message.models.GameStateMessage.Companion.GameStatePayload
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO


@JsonTypeName(GameStateMessage.TYPE)
class GameStateMessage(payload: GameStatePayload) : Message<GameStatePayload>(TYPE, payload) {
    companion object {

        const val TYPE = "game-state"

        data class GameStatePayload(
            val game: GameExtendedDTO
        )

    }
}


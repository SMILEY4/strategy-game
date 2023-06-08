package de.ruegnerlukas.strategygame.backend.gameengine.external.message.models

import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.common.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.gameengine.external.message.models.GameStateMessage.Companion.GameStatePayload


@JsonTypeName(GameStateMessage.TYPE)
class GameStateMessage(payload: GameStatePayload) : Message<GameStatePayload>(TYPE, payload) {
    companion object {

        const val TYPE = "game-state"

        data class GameStatePayload(
            val game: GameExtendedDTO
        )

    }
}


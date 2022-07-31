package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError

interface GameMessageProducer {

	suspend fun sendWorldState(connectionId: Int, game: GameExtendedEntity)

	suspend fun sendTurnResult(connectionId: Int, game: GameExtendedEntity, errors: List<CommandResolutionError>)

}
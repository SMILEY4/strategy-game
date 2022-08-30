package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity

interface GameMessageProducer {

	suspend fun sendGamedState(connectionId: Int, game: GameExtendedEntity)

}
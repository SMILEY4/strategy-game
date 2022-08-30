package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO

interface GameMessageProducer {

	suspend fun sendGamedState(connectionId: Int, game: GameExtendedDTO)

}
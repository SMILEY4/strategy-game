package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.GameExtendedDTO

interface PlayerViewCreator {
    suspend fun build(userId: String, gameId: String): GameExtendedDTO
    fun build(userId: String, game: GameExtended): GameExtendedDTO
}
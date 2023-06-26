package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor

interface InitializePlayerAction {
    suspend fun perform(gameId: String, userId: String, color: RGBColor)
}
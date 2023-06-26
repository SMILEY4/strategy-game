package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings

interface InitializeWorldAction {
    suspend fun perform(gameId: String, worldSettings: WorldSettings)
}
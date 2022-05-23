package de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby

import de.ruegnerlukas.strategygame.backend.shared.Rail

interface GameLobbiesListAction {

	suspend fun perform(userId: String): Rail<List<String>>

}
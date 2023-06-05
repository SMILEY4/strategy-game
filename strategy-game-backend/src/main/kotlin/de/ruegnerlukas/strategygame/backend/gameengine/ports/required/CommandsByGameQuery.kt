package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command


interface CommandsByGameQuery {
	suspend fun execute(gameId: String, turn: Int): List<Command<*>>
}
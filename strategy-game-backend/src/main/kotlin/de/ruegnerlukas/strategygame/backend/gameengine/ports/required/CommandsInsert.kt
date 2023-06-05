package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.Command

interface CommandsInsert {
	suspend fun execute(commands: List<Command<*>>)
}
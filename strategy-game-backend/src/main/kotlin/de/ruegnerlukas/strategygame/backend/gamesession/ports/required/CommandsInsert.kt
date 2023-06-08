package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command


interface CommandsInsert {
	suspend fun execute(commands: List<Command<*>>)
}
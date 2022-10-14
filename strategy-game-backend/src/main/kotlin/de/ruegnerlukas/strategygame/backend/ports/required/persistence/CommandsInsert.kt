package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.Command

interface CommandsInsert {
	suspend fun execute(commands: List<Command<*>>)
}
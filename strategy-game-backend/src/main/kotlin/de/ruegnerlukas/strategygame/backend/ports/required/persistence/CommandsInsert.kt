package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity

interface CommandsInsert {
	suspend fun execute(commands: List<CommandEntity<*>>)
}
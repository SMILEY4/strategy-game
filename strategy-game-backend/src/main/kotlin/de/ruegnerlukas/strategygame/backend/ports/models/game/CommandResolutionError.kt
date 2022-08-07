package de.ruegnerlukas.strategygame.backend.ports.models.game

import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity

data class CommandResolutionError(
	val command: CommandEntity<*>,
	val errorMessage: String
)
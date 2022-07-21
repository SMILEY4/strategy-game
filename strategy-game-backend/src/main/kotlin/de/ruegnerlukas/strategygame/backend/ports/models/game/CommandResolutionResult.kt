package de.ruegnerlukas.strategygame.backend.ports.models.game

import de.ruegnerlukas.strategygame.backend.ports.models.changes.DataChange
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity

data class CommandResolutionResult(
	val changes: List<DataChange>,
	val errors: Map<CommandEntity, String>
) {
	companion object {

		val EMPTY = CommandResolutionResult(emptyList(), emptyMap())

		fun internalError(command: CommandEntity, message: String) = CommandResolutionResult(
			changes = emptyList(),
			errors = mapOf(command to "internal error ($message)")
		)

		fun merge(vararg results: CommandResolutionResult) = merge(results.toList())

		fun merge(results: List<CommandResolutionResult>) = CommandResolutionResult(
			changes = results.flatMap { it.changes },
			errors = mutableMapOf<CommandEntity, String>().apply {
				results.forEach { putAll(it.errors) }
			}
		)
	}
}
package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity

interface ResolveCommandsAction {

	sealed class ResolveCommandsActionError
	object WorldNotFoundError : ResolveCommandsActionError()

	suspend fun perform(worldId: String, commands: List<CommandEntity>): Either<ResolveCommandsActionError, Unit>
}
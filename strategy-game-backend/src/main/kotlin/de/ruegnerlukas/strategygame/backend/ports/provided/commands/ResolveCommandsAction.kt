package de.ruegnerlukas.strategygame.backend.ports.provided.commands

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionResult

interface ResolveCommandsAction {

	sealed class ResolveCommandsActionError
	object CommandUnknownError : ResolveCommandsActionError()
	object WorldNotFoundError : ResolveCommandsActionError()
	object PlayerNotFoundError : ResolveCommandsActionError()
	object CountryNotFoundError : ResolveCommandsActionError()
	object TileNotFoundError : ResolveCommandsActionError()

	suspend fun perform(
		gameId: String,
		worldId: String,
		commands: List<CommandEntity>
	): Either<ResolveCommandsActionError, CommandResolutionResult>
}
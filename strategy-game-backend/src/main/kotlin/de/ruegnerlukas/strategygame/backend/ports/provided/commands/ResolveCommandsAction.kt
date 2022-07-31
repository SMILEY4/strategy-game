package de.ruegnerlukas.strategygame.backend.ports.provided.commands

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError

interface ResolveCommandsAction {

	sealed class ResolveCommandsActionError
	object CommandUnknownError : ResolveCommandsActionError()
	object GameNotFoundError : ResolveCommandsActionError()
	object CountryNotFoundError : ResolveCommandsActionError()
	object TileNotFoundError : ResolveCommandsActionError()

	suspend fun perform(gameId: String, commands: List<CommandEntity>): Either<ResolveCommandsActionError, List<CommandResolutionError>>
}
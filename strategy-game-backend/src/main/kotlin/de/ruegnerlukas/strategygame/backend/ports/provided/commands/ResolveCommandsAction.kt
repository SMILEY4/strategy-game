package de.ruegnerlukas.strategygame.backend.ports.provided.commands

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError

interface ResolveCommandsAction {

	sealed class ResolveCommandsActionError
	object GameNotFoundError : ResolveCommandsActionError()
	object CountryNotFoundError : ResolveCommandsActionError()
	object TileNotFoundError : ResolveCommandsActionError()

	suspend fun perform(game: GameExtendedEntity, commands: List<CommandEntity<*>>): Either<ResolveCommandsActionError, List<CommandResolutionError>>
}
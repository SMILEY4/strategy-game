package de.ruegnerlukas.strategygame.backend.ports.provided.commands

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

interface ResolveCommandsAction {

    sealed class ResolveCommandsActionError
    object GameNotFoundError : ResolveCommandsActionError()
    object CountryNotFoundError : ResolveCommandsActionError()
    object TileNotFoundError : ResolveCommandsActionError()
    object CityNotFoundError : ResolveCommandsActionError()

    suspend fun perform(game: GameExtended, commands: List<Command<*>>): Either<ResolveCommandsActionError, List<CommandResolutionError>>
}